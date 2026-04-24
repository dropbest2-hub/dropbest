import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { confirmOrder, rejectOrder, getPayouts, approvePayout, rejectPayout, getAdminOrders, getAllUsers } from '../controllers/admin.controller';

const router = Router();

// Users management
router.get('/users', requireAdmin, getAllUsers);

// Order confirmations (requires admin)
router.get('/orders', requireAdmin, getAdminOrders);
router.post('/orders/:id/confirm', requireAdmin, confirmOrder);
router.post('/orders/:id/reject', requireAdmin, rejectOrder);

// Payouts management
router.get('/payouts', requireAdmin, getPayouts);
router.post('/payouts/:id/approve', requireAdmin, approvePayout);
router.post('/payouts/:id/reject', requireAdmin, rejectPayout);

export default router;
