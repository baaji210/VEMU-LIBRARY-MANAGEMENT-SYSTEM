import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Request interceptor for API calls
instance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('lbm_user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
