import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { 
    getUserRewards, 
    convertCoinsToWallet, 
    getScratchCards, 
    claimScratchCard, 
    requestPayout
} from '../controllers/reward.controller';

const router = Router();

// Get user's rewards (wallet credit history)
router.get('/', requireAuth, getUserRewards);

// Convert coins to wallet
router.post('/convert', requireAuth, convertCoinsToWallet);

// Withdraw via UPI
router.post('/payout', requireAuth, requestPayout);

// Scratch Cards
router.get('/scratch-cards', requireAuth, getScratchCards);
router.post('/scratch-cards/:id/claim', requireAuth, claimScratchCard);

export default router;
