import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://thala-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('thala_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export const getStatsSummary = async () => {
  const response = await api.get('/api/documents/stats/summary');
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/api/documents');
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/api/documents/${id}`);
  return response.data;
};

export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/api/documents/${id}`);
  return response.data;
};

export const reprocessDocument = async (id) => {
  const response = await api.post(`/api/documents/${id}/reprocess`);
  return response.data;
};

export const getDocumentChunks = async (id) => {
  const response = await api.get(`/api/documents/${id}/chunks`);
  return response.data;
};

export const askQuestion = async (question) => {
  const response = await api.post('/api/chat', { question });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get('/api/chat/history');
  return response.data;
};

export const clearChatHistory = async () => {
  const response = await api.delete('/api/chat/history');
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (fullName, email, password) => {
  const response = await api.post('/api/auth/signup', { full_name: fullName, email, password });
  return response.data;
};

export const loginGoogleUser = async (googleData = {}) => {
  const response = await api.post('/api/auth/google', googleData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export default api;
