import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export const supabaseUrl = process.env.SUPABASE_URL || '';
export const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Regular client (uses anon key, respects RLS for public-facing queries)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (uses service role key, bypasses RLS for trusted backend operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
