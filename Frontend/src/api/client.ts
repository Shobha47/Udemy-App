import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const apiClient = axios.create({
  baseURL: 'https://udemy-server-emxj.onrender.com/api/v1',//http://localhost:5000/api/v1 //https://udemy-server-emxj.onrender.com/api/v1 // Replace with your machine IP address if testing on a physical device
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper utilities to handle safe cross-platform token storage
export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log(`Error reading key: ${key}`, error);
    return null;
  }
};

export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.log(`Error writing key: ${key}`, error);
  }
};

export const removeSecureItem = async (
  key: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.log(`Error removing key: ${key}`, error);
  }
};

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getSecureItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API RESPONSE ERROR:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);