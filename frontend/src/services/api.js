import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
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