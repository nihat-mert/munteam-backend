import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on /auth/me 401 errors (initial auth check)
    const isAuthMeRequest = error.config?.url?.includes('/auth/me');
    
    if (error.response?.status === 401 && window.location.pathname !== '/login' && !isAuthMeRequest) {
      localStorage.removeItem('bumlab_cart');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
