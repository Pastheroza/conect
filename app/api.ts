const BASE_URL = import.meta.env.VITE_API_URL || 'https://conect.api.hurated.com';

export interface ApiError {
  error: string;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const api = {
  /**
   * Check API health
   */
  checkHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  /**
   * Get all repositories
   */
  getRepos: async () => {
    const res = await fetch(`${BASE_URL}/api/repos`);
    return handleResponse(res);
  },

  /**
   * Add a repository
   */
  addRepo: async (url: string) => {
    const res = await fetch(`${BASE_URL}/api/repos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return handleResponse(res);
  },

  /**
   * Delete a repository
   */
  deleteRepo: async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/repos/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  /**
   * Step 1: Run Analysis
   */
  analyze: async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Step 2: Match Interfaces
   */
  match: async () => {
    const res = await fetch(`${BASE_URL}/api/match`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Step 3: Generate Glue Code
   */
  generate: async () => {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Step 4: Run Integration
   */
  integrate: async () => {
    const res = await fetch(`${BASE_URL}/api/integrate`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Step 5: Validate and get suggestions
   */
  validate: async () => {
    const res = await fetch(`${BASE_URL}/api/validate`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Step 6a: Apply Changes (Fork + PR)
   */
  apply: async () => {
    const res = await fetch(`${BASE_URL}/api/apply`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Step 6b: Publish to new Repository
   * Note: This assumes a new endpoint /api/publish exists
   */
  publish: async (name: string, isPrivate: boolean = false) => {
    const res = await fetch(`${BASE_URL}/api/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, private: isPrivate }),
    });
    return handleResponse(res);
  },

  /**
   * Run Full Pipeline (Synchronous JSON)
   */
  runAll: async () => {
    const res = await fetch(`${BASE_URL}/api/run-all`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Start Async Job
   */
  startJob: async () => {
    const res = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Get Job Status
   */
  getJob: async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/jobs/${id}`);
    return handleResponse(res);
  },

  /**
   * List Jobs
   */
  getJobs: async () => {
    const res = await fetch(`${BASE_URL}/api/jobs`);
    return handleResponse(res);
  },

  /**
   * Reset all data
   */
  reset: async () => {
    const res = await fetch(`${BASE_URL}/api/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Get Git Commit History
   */
  getHistory: async () => {
    const res = await fetch(`${BASE_URL}/api/history`);
    return handleResponse(res);
  }
};
