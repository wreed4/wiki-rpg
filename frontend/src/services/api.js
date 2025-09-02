import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Export API_URL so other components can use it for direct URL construction
export { API_URL };

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add invite key to all requests
api.interceptors.request.use(
  (config) => {
    const inviteKey = localStorage.getItem('wiki-rpg-invite-key');
    if (inviteKey) {
      config.headers['x-invite-key'] = inviteKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // If we get a 401, the invite key might be invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('wiki-rpg-invite-key');
      // Reload to trigger the invite key gate
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const charactersAPI = {
  getAll: () => api.get('/api/characters'),
  getById: (id) => api.get(`/api/characters/${id}`),
  create: (wikipediaUrl) => api.post('/api/characters/create', { wikipediaUrl }),
};

export const chatAPI = {
  createSession: (characterId, userId = 'anonymous') => 
    api.post('/api/chat/session', { characterId, userId }),
  
  getMessages: (sessionId) => 
    api.get(`/api/chat/session/${sessionId}/messages`),
  
  sendMessage: (sessionId, message) => 
    api.post(`/api/chat/session/${sessionId}/message`, { message }),
  
  getSessions: (userId = 'anonymous') => 
    api.get(`/api/chat/sessions?userId=${userId}`),
};

export default api;