/**
 * Security Rules Specification Verification Suite (Dirty Dozen Test Matrix)
 * Validates that every adversarial payload violates Firestore rules and yields PERMISSION_DENIED.
 */

export interface DirtyDozenCase {
  id: string;
  pillar: string;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 'DD-01-UNVERIFIED-EMAIL-SPOOF',
    pillar: 'Email Verification Gate',
    path: '/app_users/usr_victim',
    operation: 'get',
    auth: { uid: 'attacker_1', email: 'mrcmrcn@gmail.com', email_verified: false },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02-SHADOW-FIELD-INJECTION',
    pillar: 'Validation Blueprint (hasOnly)',
    path: '/app_users/usr_new_01',
    operation: 'create',
    auth: { uid: 'admin_uid', email: 'mrcmrcn@gmail.com', email_verified: true },
    payload: {
      id: 'usr_new_01',
      username: 'ghost',
      name: 'Ghost User',
      email: 'ghost@example.com',
      role: 'user',
      status: 'active',
      passwordHash: '',
      passwordSalt: '',
      hasCloudPassword: false,
      hasAcceptedAgreements: false,
      allowedIcons: ['agent_ai'],
      allowedAgentAiCategories: ['Finanza e Mercati'],
      createdByUid: 'admin_uid',
      isVerified: true, // Ghost shadow field
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03-SELF-ROLE-ESCALATION',
    pillar: 'Tiered Identity & Action-Based Update',
    path: '/app_users/usr_std_01',
    operation: 'update',
    auth: { uid: 'std_uid', email: 'std@example.com', email_verified: true },
    payload: { role: 'admin', allowedIcons: ['agent_ai', 'send_to_ibm'] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04-CROSS-USER-PII-SCRAPE',
    pillar: 'PII Isolation & Secure List',
    path: '/app_users',
    operation: 'list',
    auth: { uid: 'std_uid', email: 'std@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05-ID-POISONING',
    pillar: 'Path Variable Hardening',
    path: `/app_users/${'a'.repeat(200)}`,
    operation: 'create',
    auth: { uid: 'admin_uid', email: 'mrcmrcn@gmail.com', email_verified: true },
    payload: { id: 'a'.repeat(200) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06-SPOOFED-LOG-AUTHOR',
    pillar: 'Identity Integrity',
    path: '/access_logs/log_spoof_01',
    operation: 'create',
    auth: { uid: 'std_uid', email: 'std@example.com', email_verified: true },
    payload: {
      id: 'log_spoof_01',
      uid: 'victim_uid',
      userId: 'usr_victim',
      username: 'victim',
      userRole: 'user',
      timestamp: '2026-11-27T10:00:00Z',
      type: 'login',
      actionName: 'Spoofed Login',
      viewDetail: 'Spoofed detail',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07-CLIENT-TIMESTAMP-FORGERY',
    pillar: 'Temporal Integrity (request.time)',
    path: '/access_logs/log_time_01',
    operation: 'create',
    auth: { uid: 'std_uid', email: 'std@example.com', email_verified: true },
    payload: {
      id: 'log_time_01',
      uid: 'std_uid',
      userId: 'usr_std_01',
      username: 'std',
      userRole: 'user',
      timestamp: '2020-01-01T00:00:00Z',
      type: 'view_page',
      actionName: 'Backdated Log',
      viewDetail: 'Attempted backdate',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08-IMMUTABLE-CREATED-AT',
    pillar: 'Immortal Field Rule',
    path: '/app_users/usr_std_01',
    operation: 'update',
    auth: { uid: 'admin_uid', email: 'mrcmrcn@gmail.com', email_verified: true },
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09-UNBOUNDED-ARRAY-EXHAUSTION',
    pillar: 'Total Array Guarding',
    path: '/app_users/usr_arr_01',
    operation: 'create',
    auth: { uid: 'admin_uid', email: 'mrcmrcn@gmail.com', email_verified: true },
    payload: {
      id: 'usr_arr_01',
      allowedIcons: Array.from({ length: 25 }, (_, i) => `icon_${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10-INVITE-CODE-SCRAPE',
    pillar: 'Secure List Queries',
    path: '/pqc_invites',
    operation: 'list',
    auth: { uid: 'std_uid', email: 'std@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11-ORPHANED-PQC-MESSAGE',
    pillar: 'Master Gate (Parent/Peer Verification)',
    path: '/pqc_rooms/ROOM01/messages/MSG001',
    operation: 'create',
    auth: { uid: 'attacker_uid', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 'MSG001',
      roomId: 'ROOM01',
      senderUid: 'attacker_uid',
      senderPeerId: 'non_existent_peer',
      senderName: 'Attacker',
      iv: 'AAAAAAAAAAAAAAAA',
      ciphertext: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      envelopes: {},
      timestamp: '2026-11-27T10:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12-CLOSED-ROOM-WRITE',
    pillar: 'Terminal State Locking',
    path: '/pqc_rooms/CLOSED01/peers/PEER99',
    operation: 'create',
    auth: { uid: 'std_uid', email: 'std@example.com', email_verified: true },
    payload: {
      peerId: 'PEER99',
      roomId: 'CLOSED01',
      uid: 'std_uid',
      name: 'Intruder',
      publicKey: 'a'.repeat(2368),
      online: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
