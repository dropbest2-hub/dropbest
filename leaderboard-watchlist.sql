-- Database migration for Leaderboard and Watchlist features

-- 1. Watchlist Table
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    target_price NUMERIC, -- Optional: price at which user wants to be notified
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 2. Add last_price column to products to track shifts (simple version)
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS last_price NUMERIC;

-- 3. RLS Policies for Watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist" 
ON public.watchlist 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Ensure Public users can see top performers (Leaderboard)
-- The users table already has a policy for auth.uid() = id. 
-- We need a global select for basic info for the leaderboard.
DROP POLICY IF EXISTS "Allow public to see leaderboard" ON public.users;
CREATE POLICY "Allow public to see leaderboard" 
ON public.users 
FOR SELECT 
USING (true); -- We will filter columns in the API for safety
