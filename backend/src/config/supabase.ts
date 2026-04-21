import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabaseUrl = env.SUPABASE_URL;
export const supabaseKey = env.SUPABASE_ANON_KEY;
export const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

// Regular client (uses anon key, respects RLS for public-facing queries)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (uses service role key, bypasses RLS for trusted backend operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

