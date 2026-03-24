import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { confirmOrder, rejectOrder } from '../controllers/admin.controller';

const router = Router();

// Order confirmations (requires admin)
router.post('/orders/:id/confirm', requireAdmin, confirmOrder);
router.post('/orders/:id/reject', requireAdmin, rejectOrder);

// In a real app we would add user management, full product management, analytics here
// We'll trust the product.routes.ts for basic products, but this is the primary 40-day mechanics.

export default router;
