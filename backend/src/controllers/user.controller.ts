import { Request, Response } from 'express';
import { supabase, supabaseAdmin, supabaseUrl, supabaseKey } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const token = req.headers.authorization?.split(' ')[1];
        const userClient = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const { data, error } = await userClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const token = req.headers.authorization?.split(' ')[1];
        const userClient = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const { name, notifications_enabled } = req.body;

        const { data, error } = await userClient
            .from('users')
            .update({ name, notifications_enabled })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        // 1. Get top 10 users
        const { data: topUsers, error: topError } = await supabaseAdmin
            .from('users')
            .select('id, name, avatar_url, badge_count, user_level, role')
            .eq('role', 'USER')
            .order('badge_count', { ascending: false })
            .limit(10);

        if (topError) throw topError;

        let userRank = null;
        let userData = null;

        // 2. If user is logged in, calculate their rank
        if (userId) {
            // Get user's own badge count
            const { data: me } = await supabaseAdmin
                .from('users')
                .select('badge_count, name, avatar_url, user_level')
                .eq('id', userId)
                .single();
            
            if (me) {
                // Count users with more badges
                const { count } = await supabaseAdmin
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'USER')
                    .gt('badge_count', me.badge_count);
                
                userRank = (count || 0) + 1;
                userData = me;
            }
        }

        res.json({
            topUsers, // Keep top 10 for full list if needed
            top3: topUsers.slice(0, 3), 
            currentUser: userId ? { rank: userRank, ...userData } : null
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getWatchlist = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabaseAdmin
            .from('watchlist')
            .select('*, products (*)')
            .eq('user_id', userId);

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addToWatchlist = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { product_id, target_price } = req.body;

        // Check if already in watchlist
        const { data: existing } = await supabaseAdmin
            .from('watchlist')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', product_id)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ error: 'Product already in watchlist' });
        }

        const { data, error } = await supabaseAdmin
            .from('watchlist')
            .insert([{ user_id: userId, product_id, target_price }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const removeFromWatchlist = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { product_id } = req.params;

        const { error } = await supabaseAdmin
            .from('watchlist')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', product_id);

        if (error) throw error;
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getCommunityStats = async (req: Request, res: Response) => {
    try {
        const [{ count: userCount }, reviewStats] = await Promise.all([
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('reviews').select('rating').then(res => {
                const data = res.data || [];
                const count = data.length;
                const sum = data.reduce((acc, r) => acc + r.rating, 0);
                return { count, avg: count > 0 ? Number((sum / count).toFixed(1)) : 5.0 };
            })
        ]);

        res.json({ 
            totalUsers: userCount || 0, 
            avgRating: reviewStats.avg, 
            totalReviews: reviewStats.count 
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
export const applyReferralCode = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { referralCode } = req.body;

        if (!referralCode) return res.status(400).json({ error: 'Referral code is required' });

        // 1. Get current user's referral status
        const { data: me, error: meError } = await supabaseAdmin
            .from('users')
            .select('referred_by_id')
            .eq('id', userId)
            .single();

        if (meError || !me) return res.status(404).json({ error: 'User not found' });
        if (me.referred_by_id) return res.status(400).json({ error: 'Referral code already applied' });

        // 2. Find the referrer
        const { data: referrer, error: refError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('referral_code', referralCode.toUpperCase())
            .single();

        if (refError || !referrer) return res.status(404).json({ error: 'Invalid referral code' });
        if (referrer.id === userId) return res.status(400).json({ error: 'You cannot refer yourself' });

        // 3. Update current user
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('users')
            .update({ referred_by_id: referrer.id })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({ message: 'Referral code applied successfully!', referred_by: updated.referred_by_id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
