import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const axiosInstance = axios.create({
  baseURL: 'https://mobile-backend-4izv.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token'); // or whatever key you used
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

