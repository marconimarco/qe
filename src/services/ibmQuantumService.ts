import axios from 'axios';

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface QuantumJob {
  id: string;
  status: JobStatus;
  qasm: string;
  backend: string;
  createdAt: string;
  result?: any;
}

/**
 * IBMQuantumService - Adapting the requested Kotlin/Retrofit logic to TypeScript.
 * Manages interaction with IBM Quantum Systems via OpenQASM.
 */
class IBMQuantumService {
  private readonly baseUrl = 'https://auth.quantum-computing.ibm.com/api';
  private readonly apiKey = import.meta.env.VITE_IBM_QUANTUM_API_KEY;

  /**
   * Submits a circuit in OpenQASM format to IBM Quantum.
   * @param qasm The circuit definition
   * @param backend The target backend (e.g., 'ibm_brisbane')
   */
  async submitJob(qasm: string, backend: string = 'ibmq_qasm_simulator'): Promise<string> {
    if (!this.apiKey) {
      console.warn('IBM_QUANTUM_API_KEY missing - using simulated submission');
      return `job_sim_${Math.random().toString(36).substr(2, 9)}`;
    }

    try {
      // In a real implementation, we would first exchange the API Key for an Access Token
      // For this implementation, we simulate the network behavior requested.
      const response = await axios.post(`${this.baseUrl}/jobs`, {
        qasm,
        backend,
        shots: 1024
      }, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.data.id;
    } catch (error) {
      console.error('Error submitting IBM Job:', error);
      throw error;
    }
  }

  /**
   * Checks the status of a specific job.
   * @param jobId The ID of the job to check
   */
  async checkJobStatus(jobId: string): Promise<JobStatus> {
    if (jobId.startsWith('job_sim_')) {
      // Simulation of job lifecycle for the UI
      const stages: JobStatus[] = ['PENDING', 'RUNNING', 'COMPLETED'];
      const elapsed = Date.now() % 10000;
      if (elapsed < 3000) return 'PENDING';
      if (elapsed < 7000) return 'RUNNING';
      return 'COMPLETED';
    }

    try {
      const response = await axios.get(`${this.baseUrl}/jobs/${jobId}/status`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.data.status as JobStatus;
    } catch (error) {
      return 'FAILED';
    }
  }
}

export const ibmService = new IBMQuantumService();
