-- 1. Add wallet column to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;

-- 2. Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount >= 10),
    upi_id TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'REJECTED')),
    utr_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for payouts
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payouts" ON public.payout_requests FOR SELECT USING (auth.uid() = user_id);

-- 3. Modify rewards table
ALTER TABLE public.rewards ALTER COLUMN coupon_code DROP NOT NULL;
ALTER TABLE public.rewards ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'COUPON' CHECK (type IN ('COUPON', 'WALLET_CREDIT'));
