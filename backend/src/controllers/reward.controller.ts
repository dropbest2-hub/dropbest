import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import crypto from 'crypto';

export const convertBadgesToCoupon = async (req: Request, res: Response) => {
    try {
        const { badgesToUse } = req.body; // Expects 110 or 220
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (badgesToUse !== 110 && badgesToUse !== 220) {
            res.status(400).json({ error: 'You can only convert 110 or 220 badges at a time' });
            return;
        }

        const rewardAmount = badgesToUse === 110 ? 10 : 20;

        // Fetch user current badges
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('badge_count')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.badge_count < badgesToUse) {
            res.status(400).json({ error: `Not enough badges. You have ${user.badge_count} badges.` });
            return;
        }

        // Generate coupon code
        const couponCode = `BBB-${crypto.randomUUID().split('-')[0].toUpperCase()}-${rewardAmount}`;

        // Deduct badges and create reward record
        const newBadgeCount = user.badge_count - badgesToUse;

        // Update user's count (Level doesn't downgrade based on usage according to standard gamification, only upgrades, but we'll recalculate here)
        let newLevel = 'BRONZE';
        if (newBadgeCount >= 700) newLevel = 'PLATINUM';
        else if (newBadgeCount >= 300) newLevel = 'GOLD';
        else if (newBadgeCount >= 100) newLevel = 'SILVER';

        const { error: updateError } = await supabase
            .from('users')
            .update({ badge_count: newBadgeCount, user_level: newLevel })
            .eq('id', userId);

        if (updateError) throw updateError;

        // Insert reward
        const { data: reward, error: rewardError } = await supabase
            .from('rewards')
            .insert([{
                user_id: userId,
                badges_used: badgesToUse,
                reward_amount: rewardAmount,
                coupon_code: couponCode
            }])
            .select()
            .single();

        if (rewardError) throw rewardError;

        res.status(201).json({
            message: `Successfully converted ${badgesToUse} badges to ₹${rewardAmount} coupon`,
            reward
        });

    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserRewards = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabase
            .from('rewards')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getScratchCards = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabase
            .from('scratch_cards')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const claimScratchCard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const { data: card, error: cardError } = await supabase
            .from('scratch_cards')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (cardError || !card) {
            res.status(404).json({ error: 'Scratch card not found' });
            return;
        }

        if (card.status === 'SCRATCHED') {
            res.status(400).json({ error: 'Card already scratched' });
            return;
        }

        // Add coins to user
        const { data: user } = await supabase.from('users').select('coin_count').eq('id', userId).single();
        const newCoinCount = (user?.coin_count || 0) + card.coins_rewarded;

        await supabase.from('users').update({ coin_count: newCoinCount }).eq('id', userId);

        // Update card status
        await supabase
            .from('scratch_cards')
            .update({ status: 'SCRATCHED', scratched_at: new Date().toISOString() })
            .eq('id', id);

        res.json({ message: `Successfully claimed ${card.coins_rewarded} coins!`, coinsAwarded: card.coins_rewarded });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const convertCoinsToCoupon = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { coinAmount } = req.body; // Expects 1000

        if (coinAmount !== 1000) {
            res.status(400).json({ error: 'You can only convert 1000 coins for ₹10' });
            return;
        }

        const { data: user } = await supabase.from('users').select('coin_count').eq('id', userId).single();

        if (!user || user.coin_count < 1000) {
            res.status(400).json({ error: 'Not enough coins' });
            return;
        }

        const couponCode = `COIN-${crypto.randomUUID().split('-')[0].toUpperCase()}-10`;

        // Update user coins
        await supabase.from('users').update({ coin_count: user.coin_count - 1000 }).eq('id', userId);

        // Record reward
        const { data: reward } = await supabase.from('rewards').insert([{
            user_id: userId,
            badges_used: 0, // Mark 0 since it's coins
            reward_amount: 10,
            coupon_code: couponCode
        }]).select().single();

        res.json({ message: 'Successfully converted 1000 coins to ₹10 coupon', reward });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
