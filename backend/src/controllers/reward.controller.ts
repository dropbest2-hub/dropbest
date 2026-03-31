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
