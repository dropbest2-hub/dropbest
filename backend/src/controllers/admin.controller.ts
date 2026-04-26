import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

// Helper to determine coins based on value
const calculateCoins = (value: number): number => {
    if (value >= 5000) return 100;
    if (value >= 2000) return 50;
    if (value >= 1000) return 30;
    if (value >= 500) return 20;
    if (value >= 100) return 10;
    return 5; // Minimum 5 coins for any purchase
};

// Admin route to confirm an order after 40 days
export const confirmOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { purchaseValue, coins } = req.body;

        if (purchaseValue === undefined) {
            res.status(400).json({ error: 'Purchase value is required' });
            return;
        }

        // 1. Get the order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError || !order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        if (order.status === 'CONFIRMED') {
            res.status(400).json({ error: 'Order is already confirmed' });
            return;
        }

        // 2. Calculate coins (use manual override if provided)
        const earnedCoins = (coins !== undefined && coins !== null) ? Number(coins) : calculateCoins(purchaseValue);

        // 3. Update the order
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                purchase_value: purchaseValue,
                status: 'CONFIRMED',
                confirmation_sent_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error("Order Update Failed:", updateError);
            throw new Error(`Failed to update order status: ${updateError.message}`);
        }

        // 4. Update the user's total coins
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('coin_count')
            .eq('id', order.user_id)
            .single();
 
        if (!userError && user) {
            const newCoinCount = (user.coin_count || 0) + earnedCoins;
            let newLevel = 'BRONZE';
            if (newCoinCount >= 700) newLevel = 'PLATINUM';
            else if (newCoinCount >= 300) newLevel = 'GOLD';
            else if (newCoinCount >= 100) newLevel = 'SILVER';
 
            const { error: userUpdateError } = await supabaseAdmin
                .from('users')
                .update({
                    coin_count: newCoinCount,
                    badge_count: newCoinCount, // Keep in sync
                    user_level: newLevel
                })
                .eq('id', order.user_id);
                
            if (userUpdateError) {
                console.error("User Coins Update Failed:", userUpdateError);
            }
        }

        // 5. Check for existing reviews to verify and award badge
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', order.user_id)
            .eq('product_id', order.product_id)
            .eq('badge_awarded', false);

        let reviewBonus = 0;
        if (reviews && reviews.length > 0) {
            reviewBonus = 1;
            await supabaseAdmin
                .from('reviews')
                .update({ is_verified: true, badge_awarded: true }) // keep schema compatibility
                .eq('user_id', order.user_id)
                .eq('product_id', order.product_id);
            
            // Increment coin for review
            const { data: currentUser } = await supabaseAdmin.from('users').select('coin_count').eq('id', order.user_id).single();
            await supabaseAdmin.from('users').update({ coin_count: (currentUser?.coin_count || 0) + 1, badge_count: (currentUser?.coin_count || 0) + 1 }).eq('id', order.user_id);
        }

        const totalEarned = earnedCoins + reviewBonus;

        // 6. Create a notification
        await supabaseAdmin.from('notifications').insert([{
            user_id: order.user_id,
            type: 'CONFIRMATION',
            message: reviewBonus > 0 
                ? `Double Reward! Order confirmed (${earnedCoins} coins) + Verified Review bonus (1 coin)! Total: ${totalEarned} coins.`
                : `Congratulations! Your purchase has been confirmed. You earned ${earnedCoins} coins!`,
            read: false
        }]);

        // 7. GENERATE SCRATCH CARD FOR THE BUYER
        const randomCoins = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // 5 to 20 coins
        await supabaseAdmin
            .from('scratch_cards')
            .insert([{ 
                user_id: order.user_id, 
                order_id: id, 
                coins_rewarded: randomCoins,
                status: 'PENDING' 
            }]);

        // 7. Handle Referral Bonus
        const { data: referredUser, error: refUserError } = await supabase
            .from('users')
            .select('referred_by_id, referral_bonus_awarded')
            .eq('id', order.user_id)
            .single();

        if (!refUserError && referredUser?.referred_by_id && !referredUser.referral_bonus_awarded) {
            // Count confirmed orders for this user
            const { count, error: countError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', order.user_id)
                .eq('status', 'CONFIRMED');

            if (!countError && count === 1) {
                // Award 25 coins to the referrer
                const referrerId = referredUser.referred_by_id;
                
                const { data: referrer, error: referrerError } = await supabase
                    .from('users')
                    .select('coin_count')
                    .eq('id', referrerId)
                    .single();

                if (!referrerError && referrer) {
                    const newRefCoinCount = (referrer.coin_count || 0) + 25;
                    let newRefLevel = 'BRONZE';
                    if (newRefCoinCount >= 700) newRefLevel = 'PLATINUM';
                    else if (newRefCoinCount >= 300) newRefLevel = 'GOLD';
                    else if (newRefCoinCount >= 100) newRefLevel = 'SILVER';

                    await supabase
                        .from('users')
                        .update({
                            coin_count: newRefCoinCount,
                            badge_count: newRefCoinCount,
                            user_level: newRefLevel
                        })
                        .eq('id', referrerId);

                    // Mark bonus as awarded for the referred user B
                    await supabase
                        .from('users')
                        .update({ referral_bonus_awarded: true })
                        .eq('id', order.user_id);

                    // Notify referrer A
                    await supabaseAdmin.from('notifications').insert([{
                        user_id: referrerId,
                        type: 'REWARD',
                        message: `Referral Bonus! Your friend completed 1 purchase. You've been awarded 25 coins!`,
                        read: false
                    }]);
                }
            }
        }

        res.json({ message: 'Order confirmed successfully', badges: totalEarned, reviewBonus });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getAdminOrders = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                products ( title ),
                users ( email, name )
            `)
            .eq('status', 'PENDING')
            .not('external_order_id', 'is', null)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data || []);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*, referred_by:referred_by_id ( name )')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const rejectOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (orderError || !order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        const { message: customMessage } = req.body;

        // Update order status
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                status: 'REJECTED',
                confirmation_sent_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Create a notification for the user
        await supabaseAdmin.from('notifications').insert([{
            user_id: order.user_id,
            type: 'ALERT',
            message: customMessage || 'Better luck next time. Your recent tracked purchase was not confirmed.',
            read: false
        }]);

        res.json({ message: 'Order rejected successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Payouts Administration
export const getPayouts = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('payout_requests')
            .select('*, users ( email, name )')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const approvePayout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { utrNumber } = req.body;

        // 2. Get payout details AND user details to notify correctly
        const { data: payout, error: payoutErr } = await supabaseAdmin
            .from('payout_requests')
            .select('*, users ( email, name )')
            .eq('id', id)
            .single();

        if (payoutErr || !payout) {
            res.status(404).json({ error: 'Payout not found' });
            return;
        }

        // 3. Mark payout as paid in database
        const { error: updateError } = await supabaseAdmin.from('payout_requests').update({ 
            status: 'PAID', 
            utr_number: utrNumber, 
            updated_at: new Date().toISOString() 
        }).eq('id', id);

        if (updateError) throw updateError;

        const confirmationMsg = "Money received and please check ur account balance. any queries contact us.";

        // 4. INSERT INTO CONTACT MESSAGES (for the user's message page)
        await supabaseAdmin.from('contact_messages').insert([{
            email: payout.users?.email,
            name: payout.users?.name || 'User',
            subject: 'Payout Confirmation',
            message: `Request for withdrawal of ₹${payout.amount}`,
            status: 'Replied',
            admin_reply: confirmationMsg
        }]);

        // 5. Notify user via Notifications
        await supabaseAdmin.from('notifications').insert([{
            user_id: payout.user_id,
            type: 'PAYMENT',
            message: `Payout of ₹${payout.amount} Paid! ${confirmationMsg}`,
            read: false
        }]);

        res.json({ message: 'Payout approved and user notified!' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const rejectPayout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: payout } = await supabaseAdmin.from('payout_requests').select('*').eq('id', id).single();
        if (!payout) {
             res.status(404).json({ error: 'Payout not found' });
             return;
        }

        if (payout.status !== 'PENDING') {
             res.status(400).json({ error: `Cannot reject. Current status is ${payout.status}` });
             return;
        }
        
        // Refund to wallet
        const { data: user } = await supabaseAdmin.from('users').select('wallet_balance').eq('id', payout.user_id).single();
        await supabaseAdmin.from('users').update({ wallet_balance: Number(user?.wallet_balance || 0) + Number(payout.amount) }).eq('id', payout.user_id);
        
        // Reject request
        await supabaseAdmin.from('payout_requests').update({ status: 'REJECTED', updated_at: new Date().toISOString() }).eq('id', id);
        res.json({ message: 'Payout rejected and refunded successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
