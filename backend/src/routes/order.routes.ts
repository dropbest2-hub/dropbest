import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { trackRedirect, getUserOrders } from '../controllers/order.controller';

const router = Router();

// User tracks affiliate redirect (creating pending order)
router.post('/redirect', requireAuth, trackRedirect);

// User views their tracked/purchased orders
router.get('/', requireAuth, getUserOrders);

export default router;
