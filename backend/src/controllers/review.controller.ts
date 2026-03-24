import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createReview = async (req: Request, res: Response) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Verify user has at least TRACKED an order for this product
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('status')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .limit(1);

        if (orderError || !orders || orders.length === 0) {
            return res.status(403).json({ error: 'You must have at least clicked and tracked this product to leave a review.' });
        }

        const isConfirmed = orders[0].status === 'CONFIRMED';
        
        // Check if review already exists
        const { data: existing } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'You have already reviewed this product.' });
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                user_id: userId,
                product_id: productId,
                rating,
                comment,
                is_verified: isConfirmed,
                badge_awarded: isConfirmed
            }])
            .select()
            .single();

        if (error) throw error;

        // If confirmed, award badge immediately
        if (isConfirmed) {
            await supabase.rpc('increment_badge', { user_id_param: userId, amount: 1 });
        }

        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        users ( name, avatar_url, user_level, badge_count )
      `)
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
