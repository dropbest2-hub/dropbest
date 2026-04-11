import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { 
    getUserProfile, 
    updateUserProfile, 
    getLeaderboard, 
    getWatchlist, 
    addToWatchlist, 
    removeFromWatchlist,
    getCommunityStats,
    applyReferralCode
} from '../controllers/user.controller';

const router = Router();

// Public routes
router.get('/stats', getCommunityStats);
router.get('/leaderboard', getLeaderboard);

// Profile & Private routes
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);
router.post('/referral/apply', requireAuth, applyReferralCode);

// Watchlist routes
router.get('/watchlist', requireAuth, getWatchlist);
router.post('/watchlist', requireAuth, addToWatchlist);
router.delete('/watchlist/:product_id', requireAuth, removeFromWatchlist);

export default router;
