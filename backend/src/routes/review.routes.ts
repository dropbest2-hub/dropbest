import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { createReview, getProductReviews } from '../controllers/review.controller';

const router = Router();

// Create review (auth + confirmed purchase required)
router.post('/', requireAuth, createReview);

// Get reviews for a product
router.get('/:productId', getProductReviews);

export default router;
