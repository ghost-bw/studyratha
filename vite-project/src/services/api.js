import axios from 'axios';

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

export default api;
