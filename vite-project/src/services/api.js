import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch (e) {
      console.error('Error parsing userInfo', e);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('userInfo');
      // Only redirect if not already on login/signup/forgot-password
      const publicPaths = ['/login', '/signup', '/forgot-password', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    // Log error for production debugging
    console.error('[API Error]:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: message
    });

    return Promise.reject(error);
  }
);

export default api;
