const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }
  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  getMyReports: () => request('/reports/mine'),
  createReport: (payload) => request('/reports/create', { method: 'POST', body: JSON.stringify(payload) }),
  updateReport: (id, payload) => request(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  submitReport: (id) => request(`/reports/${id}/submit`, { method: 'POST' }),
  getReports: (params = '') => request(`/reports/all${params}`),
  getDashboardSummary: (params = '') => request(`/reports/summary/dashboard${params}`),
  getProjects: () => request('/projects'),
  getTeamMembers: () => request('/users/team-members'),
  createProject: (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  askChatbot: (message) => request('/reports/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};

export { request };