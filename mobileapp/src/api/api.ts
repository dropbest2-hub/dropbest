import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Local Testing (Replace with your IP or 10.0.2.2 for emulator)
const API_URL = 'https://dropbest-api.vercel.app/api'; 

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
