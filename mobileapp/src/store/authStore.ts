import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../api/supabase';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

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
    referral_code: string | null;
    referred_by_id: string | null;
    referred_by?: { name: string } | null;
    notifications_enabled: boolean;
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
    signInWithGoogle: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
    },

    signInWithGoogle: async () => {
        set({ loading: true });
        try {
            const redirectUrl = Linking.createURL('auth-callback');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data?.url) {
                const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

                if (res.type === 'success') {
                    const { url } = res;
                    const parts = url.split('#');
                    if (parts.length < 2) return;

                    const hash = parts[1];
                    const params = Object.fromEntries(
                        hash.split('&').map(part => part.split('='))
                    );

                    const access_token = params.access_token;
                    const refresh_token = params.refresh_token;

                    if (access_token && refresh_token) {
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token,
                            refresh_token,
                        });

                        if (sessionError) throw sessionError;

                        const response = await api.get('/auth/me', {
                            headers: { Authorization: `Bearer ${access_token}` }
                        });

                        await get().login(access_token, response.data.user);
                    }
                }
            }
        } catch (error) {
            console.error('Google Auth Error:', error);
            Alert.alert("Login Failed", "Could not complete Google Sign-In. Please try again.");
        } finally {
            set({ loading: false });
        }
    },
 
    refreshUser: async () => {
        try {
            const response = await api.get('/auth/me');
            const updatedUser = response.data.user;
            set({ user: updatedUser });
            await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to refresh user profile', error);
        }
    }
}));
