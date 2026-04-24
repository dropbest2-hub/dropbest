import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    role: string;
    badge_count: number;
    coin_count: number;
    wallet_balance: number;
    user_level: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    initialized: boolean;
    loading: boolean;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    updateCoins: (newCount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    initialized: false,
    loading: true,

    login: async (token, user) => {
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
        set({ token, user, initialized: true });
    },

    logout: async () => {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
        set({ token: null, user: null });
    },

    initializeAuth: async () => {
        set({ loading: true });
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const userData = await AsyncStorage.getItem('user_data');
            
            if (token && userData) {
                // Verify token with backend
                try {
                    const response = await api.get('/auth/me');
                    set({ user: response.data.user, token, initialized: true });
                } catch (err) {
                    await AsyncStorage.removeItem('auth_token');
                    await AsyncStorage.removeItem('user_data');
                    set({ user: null, token: null, initialized: true });
                }
            } else {
                set({ initialized: true });
            }
        } catch (error) {
            console.error('Auth initialization failed', error);
            set({ initialized: true });
        } finally {
            set({ loading: false });
        }
    },

    updateCoins: (newCount) => {
        set((state) => ({
            user: state.user ? { ...state.user, badge_count: newCount, coin_count: newCount } : null
        }));
    }
}));
