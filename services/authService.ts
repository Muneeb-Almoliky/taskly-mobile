import { Platform } from 'react-native';
import api, { setAccessToken, clearAccessToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from "expo-secure-store"

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  console.log('Login payload:', payload);

  try {
    const { data } = await api.post('/auth/login', payload);
    console.log('Login response data:', data);

    // Store access token securely
    await setAccessToken(data.accessToken);

    // Refresh token is HttpOnly and sent automatically by Axios
    return data;
  } catch (err: any) {
    console.error('Login request failed:', err.response?.data || err.message);
    throw err;
  }
}

export async function signup(payload: SignupPayload) {
  console.log('Signup payload:', payload);

  try {
    const { data } = await api.post('/auth/signup', payload);
    console.log('Signup response data:', data);

    // Store access token securely
    await setAccessToken(data.accessToken);

    return data;
  } catch (err: any) {
    console.error('Signup request failed:', err.response?.data || err.message);
    throw err;
  }
}

export async function logout() {
  try {
    // Backend clears HttpOnly refresh token cookie automatically
    await api.post('/auth/logout');
    console.log('Logged out successfully');
  } catch (err: any) {
    console.warn('Logout request failed:', err.response?.data || err.message);
  }

  // Clear access token from SecureStore
  await clearAccessToken();
}


export async function storeEmail(email: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('email', email);
    return;
  }
  await SecureStore.setItemAsync('email', email);
}

export async function getEmail() {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem('email');
  }
  return await SecureStore.getItemAsync('email');
}