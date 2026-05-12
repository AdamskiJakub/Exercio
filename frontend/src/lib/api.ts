import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { API_BASE_URL } from './utils/api-url';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

  if (!config.headers['Content-Type'] && !isFormData) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                             error.config?.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        useAuthStore.getState().logout();

        if (typeof window !== 'undefined') {
          setTimeout(() => {
            if (!useAuthStore.getState().isAuthenticated) {
              const segments = window.location.pathname.split('/').filter(Boolean);
              const locale = segments[0] || 'pl';
              window.location.href = `/${locale}/login`;
            }
          }, 100);
        }
      }
    }
    return Promise.reject(error);
  }
);
