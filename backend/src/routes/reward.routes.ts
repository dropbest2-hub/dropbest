import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getUserRewards, convertBadgesToCoupon } from '../controllers/reward.controller';

const router = Router();

// Get user's rewards
router.get('/', requireAuth, getUserRewards);

// Convert badges to coupon
router.post('/convert', requireAuth, convertBadgesToCoupon);

export default router;
