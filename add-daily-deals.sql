-- Run this in your Supabase SQL Editor to mark products as Daily Deals
-- This will populate the "Daily Deals" section on your Home Page and Daily Deals page

UPDATE public.products 
SET 
    is_daily_deal = true,
    deal_discount_text = 'SAVE ₹5,000',
    deal_tag = 'BEST SELLER',
    deal_expires_at = NOW() + INTERVAL '24 hours'
WHERE title LIKE '%Sony%';

UPDATE public.products 
SET 
    is_daily_deal = true,
    deal_discount_text = 'FLAT 20% OFF',
    deal_tag = 'FLASH DEAL',
    deal_expires_at = NOW() + INTERVAL '12 hours'
WHERE title LIKE '%Samsung%';

UPDATE public.products 
SET 
    is_daily_deal = true,
    deal_discount_text = 'LIMITED OFFER',
    deal_tag = 'NEW ARRIVAL',
    deal_expires_at = NOW() + INTERVAL '8 hours'
WHERE title LIKE '%Logitech%';

UPDATE public.products 
SET 
    is_daily_deal = true,
    deal_discount_text = 'COINS REWARD',
    deal_tag = 'HOT DEAL',
    deal_expires_at = NOW() + INTERVAL '48 hours'
WHERE title LIKE '%MacBook%';
