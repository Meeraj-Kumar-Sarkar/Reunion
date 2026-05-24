import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

const getAuthHeader = () => {
  const token = sessionStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Auth ──────────────────────────────────────────────────────────────────
export const adminLogin = async (password) => {
  const { data } = await api.post('/api/admin/login', { password });
  return data;
};

// ─── Contributions ─────────────────────────────────────────────────────────
export const getContributions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  const { data } = await api.get(`/api/admin/contributions?${params.toString()}`, {
    headers: getAuthHeader(),
  });
  return data;
};

export const verifyContribution = async (id) => {
  const { data } = await api.patch(`/api/admin/contributions/${id}/verify`, {}, {
    headers: getAuthHeader(),
  });
  return data;
};

export const createContribution = async (payload) => {
  const { data } = await api.post('/api/admin/contributions', payload, {
    headers: getAuthHeader(),
  });
  return data;
};

export const updateContribution = async (id, payload) => {
  const { data } = await api.put(`/api/admin/contributions/${id}`, payload, {
    headers: getAuthHeader(),
  });
  return data;
};

export const deleteContribution = async (id) => {
  const { data } = await api.delete(`/api/admin/contributions/${id}`, {
    headers: getAuthHeader(),
  });
  return data;
};

// ─── Funding Settings ──────────────────────────────────────────────────────
export const getFundingStatus = async () => {
  const { data } = await api.get('/api/admin/settings/funding-status', {
    headers: getAuthHeader(),
  });
  return data;
};

export const setFundingStatus = async (fundingActive) => {
  const { data } = await api.patch('/api/admin/settings/funding-status', { fundingActive }, {
    headers: getAuthHeader(),
  });
  return data;
};
