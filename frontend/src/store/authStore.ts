import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import axios from 'axios';

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    role: 'USER' | 'ADMIN';
    badge_count: number;
    coin_count: number;
    user_level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    notifications_enabled: boolean;
    referral_code?: string;
    referred_by_id?: string;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    initializeAuth: () => Promise<void>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<User>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<User>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    loading: true,
    initialized: false,

    setUser: (user) => set({ user }),

    initializeAuth: async () => {
        try {
            // Get session from Supabase
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                if (error) {
                    // If there's an error like invalid refresh token, clear out local storage
                    await supabase.auth.signOut().catch(() => {});
                }
                set({ session: null, user: null, loading: false, initialized: true });
                return;
            }

            // We have a session, fetch DB user data from our backend
            const response = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });

            set({
                session,
                user: response.data.user,
                loading: false,
                initialized: true
            });

        } catch (error) {
            console.error('Failed to initialize auth:', error);
            set({ session: null, user: null, loading: false, initialized: true });
        }

        // Set up auth listener
        supabase.auth.onAuthStateChange(async (event, session) => {
            set({ loading: true });
            if (session) {
                try {
                    const response = await axios.get(`${API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });
                    set({ session, user: response.data.user, loading: false });
                } catch (error) {
                    console.error('Error fetching user on state change', error);
                    set({ session, user: null, loading: false });
                }
            } else {
                set({ session: null, user: null, loading: false });
            }
        });
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
    },

    signInWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
    },

    signInWithEmail: async (email, password) => {
        set({ loading: true });
        try {
            const { data: { session }, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (session) {
                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                const fetchedUser = response.data.user;
                set({ session, user: fetchedUser, loading: false });
                return fetchedUser;
            }
            throw new Error('No session returned after sign in');
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    signUpWithEmail: async (email, password, name) => {
        set({ loading: true });
        try {
            const { data: { session }, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) {
                if (error.status === 429) {
                    throw new Error('Verification limit reached. Please wait a few minutes before trying again or check your email if you already signed up.');
                }
                throw error;
            }

            if (session) {
                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${session.access_token}` }
                });
                const fetchedUser = response.data.user;
                set({ session, user: fetchedUser, loading: false });
                return fetchedUser;
            }
            
            set({ loading: false });
            // If no session but no error, it usually means email confirmation is required
            throw new Error('Account created! Please check your email and click the confirmation link to sign in.');
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    }
}));
