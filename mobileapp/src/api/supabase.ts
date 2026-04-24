import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// These should be in an .env file for production
const supabaseUrl = 'https://hiutepcjueudehhufroi.supabase.co';
const supabaseAnonKey = 'sb_publishable_lg-U5s6Qe8Zz15uCM1uOoQ_SVeK0F6n';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
