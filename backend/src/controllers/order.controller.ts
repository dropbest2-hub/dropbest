import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

export const trackRedirect = async (req: Request, res: Response) => {
    try {
        const { productId } = req.body;
        const userId = req.user?.id; // From auth middleware

        if (!userId || !productId) {
            res.status(400).json({ error: 'User ID and Product ID required' });
            return;
        }

        // Check if an order already exists for this user and product that is pending
        const { data: existingOrder } = await supabaseAdmin
            .from('orders')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('status', 'PENDING')
            .maybeSingle();

        if (existingOrder) {
            res.status(200).json({ message: 'Redirect already tracked', order: existingOrder });
            return;
        }

        // Create a new PENDING order representing the affiliate click
        const { data, error } = await supabaseAdmin
            .from('orders')
            .insert([{
                user_id: userId,
                product_id: productId,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select(`
        *,
        products ( title, image_url )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const claimOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { externalOrderId, purchaseValue } = req.body;
        const userId = req.user?.id;

        const { data, error } = await supabase
            .from('orders')
            .update({ 
                external_order_id: externalOrderId,
                purchase_value: purchaseValue,
                status: 'PENDING' // Keep it pending but with data for admin
            })
            .eq('id', orderId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
