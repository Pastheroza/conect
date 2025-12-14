const BASE_URL = 'https://conect.api.hurated.com';

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
   * Run Full Pipeline (JSON)
   */
  runAll: async () => {
    const res = await fetch(`${BASE_URL}/api/run-all`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  /**
   * Get SSE Endpoint URL for Run All Stream
   */
  getRunAllStreamUrl: () => {
    return `${BASE_URL}/api/run-all/stream`;
  },

  /**
   * Reset all data
   */
  reset: async () => {
    const res = await fetch(`${BASE_URL}/api/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  }
};
