import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL_MOBILE; // your backend

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

    if (error.response?.status === 401 || error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh endpoint reads refreshToken from cookie automatically
        const res = await api.get('/refresh');
        const newAccessToken = res.data.accessToken;

        await setAccessToken(newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh failed:', refreshError);
        await clearAccessToken();
        router.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export { clearAccessToken, setAccessToken };
export default api;
