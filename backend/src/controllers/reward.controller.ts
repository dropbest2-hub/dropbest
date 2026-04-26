import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import crypto from 'crypto';

export const convertCoinsToWallet = async (req: Request, res: Response) => {
    try {
        const { coinsToUse } = req.body; // Expects 110 or 200
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (coinsToUse !== 110 && coinsToUse !== 200) {
            res.status(400).json({ error: 'You can only convert 110 or 200 coins at a time' });
            return;
        }

        const rewardAmount = coinsToUse === 110 ? 10 : 20;

        // Fetch user current coins and wallet
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('coin_count, wallet_balance')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (Number(user.coin_count || 0) < coinsToUse) {
            res.status(400).json({ error: `Not enough coins. You have ${user.coin_count || 0} coins.` });
            return;
        }

        // Deduct coins and create reward record
        const newCoinCount = Number(user.coin_count || 0) - coinsToUse;
        const newWalletBalance = Number(user.wallet_balance || 0) + rewardAmount;

        let newLevel = 'BRONZE';
        if (newCoinCount >= 700) newLevel = 'PLATINUM';
        else if (newCoinCount >= 300) newLevel = 'GOLD';
        else if (newCoinCount >= 100) newLevel = 'SILVER';

        const { error: updateError } = await supabase
            .from('users')
            .update({ coin_count: newCoinCount, badge_count: newCoinCount, user_level: newLevel, wallet_balance: newWalletBalance })
            .eq('id', userId);

        if (updateError) throw updateError;

        // Insert reward tracking (as WALLET_CREDIT)
        const { data: reward, error: rewardError } = await supabase
            .from('rewards')
            .insert([{
                user_id: userId,
                badges_used: coinsToUse, // Keeping DB column backward compatible if needed
                reward_amount: rewardAmount,
                type: 'WALLET_CREDIT'
            }])
            .select()
            .single();

        if (rewardError) throw rewardError;

        res.status(201).json({
            message: `Successfully converted ${coinsToUse} coins to ₹${rewardAmount} Wallet Balance`,
            reward: { ...reward, wallet_balance: newWalletBalance }
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

        await supabase.from('users').update({ coin_count: newCoinCount, badge_count: newCoinCount }).eq('id', userId);

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

// Request Payout
export const requestPayout = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { upiId, coins, amount } = req.body; // Expects coins and calculated amount

        if (!upiId || typeof upiId !== 'string' || !upiId.includes('@')) {
            res.status(400).json({ error: 'Please provide a valid UPI ID (e.g. dropbest@ybl)' });
            return;
        }

        if (!coins || coins < 100) {
            res.status(400).json({ error: 'Minimum payout is 100 coins' });
            return;
        }

        // Lock/Verify User Balance
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('coin_count')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (Number(user.coin_count || 0) < coins) {
            res.status(400).json({ error: `Insufficient coins. You have ${user.coin_count || 0} coins.` });
            return;
        }

        // 3. Create Payout Request (Resilient Insert)
        let payoutInsertError = null;
        
        // Attempt 1: Full insert
        const { error: err1 } = await supabaseAdmin
            .from('payout_requests')
            .insert([{
                user_id: userId,
                amount: amount,
                upi_id: upiId,
                status: 'PENDING'
            }]);
        
        if (err1) {
            console.error("Attempt 1 Failed:", err1.message);
            // Attempt 2: Minimal insert (maybe upi_id column is missing or named differently)
            const { error: err2 } = await supabaseAdmin
                .from('payout_requests')
                .insert([{
                    user_id: userId,
                    amount: amount,
                    status: 'PENDING'
                }]);
            
            if (err2) {
                console.error("Attempt 2 Failed:", err2.message);
                payoutInsertError = err2;
            }
        }

        if (payoutInsertError) {
            throw new Error(`Database Error: ${payoutInsertError.message}`);
        }

        // 4. Deduct from User Coins (Only if payout request was created)
        const newCoinCount = Number(user.coin_count) - coins;
        await supabaseAdmin
            .from('users')
            .update({ 
                coin_count: newCoinCount, 
                badge_count: newCoinCount
            })
            .eq('id', userId);

        res.status(201).json({ 
            message: `Success! Withdrawal request for ${coins} coins submitted.`,
            coinsAwarded: coins 
        });

    } catch (err: any) {
        console.error("Final Payout Exception:", err);
        res.status(500).json({ 
            error: `Failed: ${err.message}`,
            details: "Please contact support if this persists."
        });
    }
};
