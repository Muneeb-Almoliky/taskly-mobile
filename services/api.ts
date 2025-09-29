import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export function getBaseUrl() {
  return BASE_URL;
}
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ensures cookies are sent automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Token helpers ---
async function getAccessToken() {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem('accessToken');
  }

  return await SecureStore.getItemAsync('accessToken');
}
async function setAccessToken(token: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('accessToken', token);
    return;
  }
  await SecureStore.setItemAsync('accessToken', token);
}
async function clearAccessToken() {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem('accessToken');
    return;
  }
  await SecureStore.deleteItemAsync('accessToken');
}

// --- Request Interceptor (attach access token) ---
api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor (handle expired access token) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if we should attempt refresh
    if ((error.response?.status === 401 || error.response?.status === 403) && 
        !originalRequest._retry && 
        !originalRequest._isRefreshRequest) {
      
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Limit retries
      if (originalRequest._retryCount > 3) {
        console.error('Max retry attempts reached');
        await clearAccessToken();
        router.replace('/login');
        return Promise.reject(error);
      }

      try {
        // Add delay for exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, originalRequest._retryCount) * 1000)
        );

        // Mark refresh request to avoid intercepting it
        const refreshConfig: any = { _isRefreshRequest: true };
        const res = await api.get('/refresh', refreshConfig);
        const newAccessToken = res.data.accessToken;

        await setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh failed:', refreshError);
        await clearAccessToken();
        router.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { clearAccessToken, setAccessToken };
export default api;
