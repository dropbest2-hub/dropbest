import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { 
    getUserRewards, 
    convertBadgesToCoupon, 
    getScratchCards, 
    claimScratchCard, 
    convertCoinsToCoupon 
} from '../controllers/reward.controller';

const router = Router();

// Get user's rewards
router.get('/', requireAuth, getUserRewards);

// Convert badges to coupon
router.post('/convert', requireAuth, convertBadgesToCoupon);

// Scratch Cards
router.get('/scratch-cards', requireAuth, getScratchCards);
router.post('/scratch-cards/:id/claim', requireAuth, claimScratchCard);

// Coin Conversion
router.post('/convert-coins', requireAuth, convertCoinsToCoupon);

export default router;
