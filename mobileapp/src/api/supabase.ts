import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// These should be in an .env file for production
const supabaseUrl = 'https://hiutepcjueudehhufroi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdXRlcGNqdWV1ZGVoaHVmcm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTk0ODQsImV4cCI6MjA4ODc3NTQ4NH0.XM1yRtfAX9WA53S6zFTjxVoku8HRrmSM8GLwYHlfi7s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
