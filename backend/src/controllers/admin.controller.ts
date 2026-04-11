import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Helper to determine badges based on value
const calculateBadges = (value: number): number => {
    if (value >= 2000) return 10;
    if (value >= 300) return 8;
    return 0; 
};

// Admin route to confirm an order after 40 days
export const confirmOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { purchaseValue } = req.body;

        if (purchaseValue === undefined) {
            res.status(400).json({ error: 'Purchase value is required' });
            return;
        }

        if (purchaseValue < 300) {
            res.status(400).json({ error: 'Purchase value must be at least ₹300 to earn badges' });
            return;
        }

        // 1. Get the order
        const { data: order, error: orderError } = await supabase
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

        // 2. Calculate badges
        const earnedBadges = calculateBadges(purchaseValue);

        // 3. Update the order
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                purchase_value: purchaseValue,
                status: 'CONFIRMED',
                confirmed_badges: earnedBadges,
                confirmation_sent_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // 4. Update the user's total badges
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('badge_count')
            .eq('id', order.user_id)
            .single();

        if (!userError && user) {
            const newBadgeCount = user.badge_count + earnedBadges;
            let newLevel = 'BRONZE';
            if (newBadgeCount >= 700) newLevel = 'PLATINUM';
            else if (newBadgeCount >= 300) newLevel = 'GOLD';
            else if (newBadgeCount >= 100) newLevel = 'SILVER';

            await supabase
                .from('users')
                .update({
                    badge_count: newBadgeCount,
                    user_level: newLevel
                })
                .eq('id', order.user_id);
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
            await supabase
                .from('reviews')
                .update({ is_verified: true, badge_awarded: true })
                .eq('user_id', order.user_id)
                .eq('product_id', order.product_id);
            
            // Increment badge for review
            await supabase.rpc('increment_badge', { user_id_param: order.user_id, amount: 1 });
        }

        const totalEarned = earnedBadges + reviewBonus;

        // 6. Create a notification
        await supabase.from('notifications').insert([{
            user_id: order.user_id,
            type: 'CONFIRMATION',
            message: reviewBonus > 0 
                ? `Double Reward! Order confirmed (${earnedBadges} badges) + Verified Review bonus (1 badge)! Total: ${totalEarned} badges.`
                : `Congratulations! Your purchase has been confirmed. You earned ${earnedBadges} badges!`,
            read: false
        }]);

        // 7. GENERATE SCRATCH CARD FOR THE BUYER
        const randomCoins = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // 5 to 20 coins
        await supabase
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

            if (!countError && count === 3) {
                // Award 25 badges to the referrer
                const referrerId = referredUser.referred_by_id;
                
                const { data: referrer, error: referrerError } = await supabase
                    .from('users')
                    .select('badge_count')
                    .eq('id', referrerId)
                    .single();

                if (!referrerError && referrer) {
                    const newRefBadgeCount = referrer.badge_count + 25;
                    let newRefLevel = 'BRONZE';
                    if (newRefBadgeCount >= 700) newRefLevel = 'PLATINUM';
                    else if (newRefBadgeCount >= 300) newRefLevel = 'GOLD';
                    else if (newRefBadgeCount >= 100) newRefLevel = 'SILVER';

                    await supabase
                        .from('users')
                        .update({
                            badge_count: newRefBadgeCount,
                            user_level: newRefLevel
                        })
                        .eq('id', referrerId);

                    // Mark bonus as awarded for the referred user B
                    await supabase
                        .from('users')
                        .update({ referral_bonus_awarded: true })
                        .eq('id', order.user_id);

                    // Notify referrer A
                    await supabase.from('notifications').insert([{
                        user_id: referrerId,
                        type: 'REWARD',
                        message: `Referral Bonus! Your friend completed 3 purchases. You've been awarded 25 badges!`,
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

export const rejectOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: order, error: orderError } = await supabase
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
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'REJECTED',
                confirmation_sent_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Create a notification for the user
        await supabase.from('notifications').insert([{
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
