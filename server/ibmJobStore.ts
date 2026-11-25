import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

export interface StoredIbmJob {
  jobId: string;
  backend: string;
  isSimulator: boolean;
  instanceName: string;
  crn: string;
  shots: number;
  numBits: number;
  gateCount: number;
  status: string;
  rawState: string | null;
  errorReason: string | null;
  isaQasm: string | null;
  counts: Record<string, number> | null;
  totalShots: number | null;
  createdAt: string;
  updatedAt: string;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DB_DIR, 'ibm_quantum_jobs.sqlite');

let dbInstance: DatabaseSync | null = null;

// Strictly in-memory volatile key map for background polling while jobs sit in IBM QPU queues.
// Keys are NEVER persisted to disk and are removed immediately upon job completion or TTL expiry.
const activeWorkerKeys = new Map<string, { apiKey: string; expiresAt: number }>();
let workerTimer: ReturnType<typeof setInterval> | null = null;
let isWorkerSweepRunning = false;

function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS ibm_jobs (
      job_id TEXT PRIMARY KEY,
      backend TEXT NOT NULL,
      is_simulator INTEGER NOT NULL DEFAULT 0,
      instance_name TEXT,
      crn TEXT NOT NULL,
      shots INTEGER NOT NULL,
      num_bits INTEGER NOT NULL,
      gate_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      raw_state TEXT,
      error_reason TEXT,
      isa_qasm TEXT,
      counts_json TEXT,
      total_shots INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ibm_jobs_created ON ibm_jobs(created_at DESC);
  `);

  dbInstance = db;
  return db;
}

function mapRow(row: any): StoredIbmJob {
  let counts: Record<string, number> | null = null;
  if (row.counts_json) {
    try {
      counts = JSON.parse(String(row.counts_json));
    } catch {
      counts = null;
    }
  }
  return {
    jobId: String(row.job_id),
    backend: String(row.backend),
    isSimulator: Boolean(row.is_simulator),
    instanceName: String(row.instance_name || 'IBM Quantum Instance'),
    crn: String(row.crn),
    shots: Number(row.shots || 1024),
    numBits: Number(row.num_bits || 2),
    gateCount: Number(row.gate_count || 0),
    status: String(row.status),
    rawState: row.raw_state ? String(row.raw_state) : null,
    errorReason: row.error_reason ? String(row.error_reason) : null,
    isaQasm: row.isa_qasm ? String(row.isa_qasm) : null,
    counts,
    totalShots: row.total_shots != null ? Number(row.total_shots) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function saveSubmittedJob(entry: {
  jobId: string;
  backend: string;
  isSimulator: boolean;
  instanceName: string;
  crn: string;
  shots: number;
  numBits: number;
  gateCount: number;
  status: string;
  rawState?: string;
  isaQasm?: string;
}): StoredIbmJob {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT OR REPLACE INTO ibm_jobs (
      job_id, backend, is_simulator, instance_name, crn, shots, num_bits,
      gate_count, status, raw_state, error_reason, isa_qasm, counts_json,
      total_shots, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL, ?, ?)
  `).run(
    entry.jobId,
    entry.backend,
    entry.isSimulator ? 1 : 0,
    entry.instanceName,
    entry.crn,
    entry.shots,
    entry.numBits,
    entry.gateCount,
    entry.status,
    entry.rawState || entry.status,
    entry.isaQasm || null,
    now,
    now
  );

  return getSavedJob(entry.jobId)!;
}

export function updateJobState(
  jobId: string,
  patch: {
    status: string;
    rawState?: string | null;
    errorReason?: string | null;
    backend?: string | null;
    counts?: Record<string, number> | null;
    totalShots?: number | null;
  }
) {
  const db = getDb();
  const now = new Date().toISOString();
  const countsJson = patch.counts ? JSON.stringify(patch.counts) : null;

  db.prepare(`
    UPDATE ibm_jobs
    SET status = ?,
        raw_state = COALESCE(?, raw_state),
        error_reason = ?,
        backend = COALESCE(?, backend),
        counts_json = COALESCE(?, counts_json),
        total_shots = COALESCE(?, total_shots),
        updated_at = ?
    WHERE job_id = ?
  `).run(
    patch.status,
    patch.rawState ?? null,
    patch.errorReason ?? null,
    patch.backend ?? null,
    countsJson,
    patch.totalShots ?? null,
    now,
    jobId
  );

  if (patch.status === 'COMPLETED' || patch.status === 'FAILED' || patch.status === 'CANCELLED') {
    clearActiveWorkerKey(jobId);
  }
}

export function getSavedJob(jobId: string): StoredIbmJob | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM ibm_jobs WHERE job_id = ?').get(jobId);
  return row ? mapRow(row) : null;
}

export function listSavedJobs(limit = 25): StoredIbmJob[] {
  const db = getDb();
  const safeLimit = Math.max(1, Math.min(100, Number(limit || 25)));
  const rows = db.prepare('SELECT * FROM ibm_jobs ORDER BY created_at DESC LIMIT ?').all(safeLimit);
  return rows.map(mapRow);
}

export function deleteSavedJob(jobId: string): boolean {
  const db = getDb();
  clearActiveWorkerKey(jobId);
  const res = db.prepare('DELETE FROM ibm_jobs WHERE job_id = ?').run(jobId);
  return Number(res.changes || 0) > 0;
}

export function registerActiveWorkerKey(jobId: string, apiKey: string) {
  if (!jobId || !apiKey) return;
  // Keep in volatile RAM only (max 12h while job waits in QPU queue)
  activeWorkerKeys.set(jobId, {
    apiKey,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  });
}

export function clearActiveWorkerKey(jobId: string) {
  activeWorkerKeys.delete(jobId);
}

export function startBackgroundJobWorker(
  pollFn: (params: {
    apiKey: string;
    jobId: string;
    crn: string;
    numBits: number;
  }) => Promise<{
    status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    rawState: string;
    reason: string | null;
    backend: string | null;
    counts: Record<string, number> | null;
    totalShots: number;
  }>
) {
  if (workerTimer) return;

  workerTimer = setInterval(async () => {
    if (isWorkerSweepRunning) return;
    isWorkerSweepRunning = true;

    try {
      const now = Date.now();
      for (const [jId, entry] of activeWorkerKeys.entries()) {
        if (entry.expiresAt < now) {
          activeWorkerKeys.delete(jId);
        }
      }

      if (activeWorkerKeys.size === 0) return;

      const db = getDb();
      const pendingRows = db
        .prepare("SELECT * FROM ibm_jobs WHERE status IN ('QUEUED', 'RUNNING', 'SUBMITTING') ORDER BY created_at DESC LIMIT 20")
        .all();

      for (const row of pendingRows) {
        const job = mapRow(row);
        const keyEntry = activeWorkerKeys.get(job.jobId);
        if (!keyEntry) continue;

        try {
          const poll = await pollFn({
            apiKey: keyEntry.apiKey,
            jobId: job.jobId,
            crn: job.crn,
            numBits: job.numBits,
          });
          updateJobState(job.jobId, {
            status: poll.status,
            rawState: poll.rawState,
            errorReason: poll.reason,
            backend: poll.backend,
            counts: poll.counts,
            totalShots: poll.totalShots || null,
          });
        } catch (err: any) {
          console.warn(`[IBM WORKER] Polling background saltato per ${job.jobId}: ${err?.message || 'errore rete'}`);
        }
      }
    } finally {
      isWorkerSweepRunning = false;
    }
  }, 15_000);
}
