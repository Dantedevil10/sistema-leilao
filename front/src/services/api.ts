import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Interceptador de Requisição: Adiciona o token na ida
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptador de Resposta: Vigia erros na volta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o backend disser que não estamos autorizados (401)
    if (error.response && error.response.status === 401) {
      console.warn('Sessão expirada ou inválida. Deslogando...');
      
      // Limpa os dados fantasmas do cache
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redireciona para o login apenas se já não estiver na tela de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;