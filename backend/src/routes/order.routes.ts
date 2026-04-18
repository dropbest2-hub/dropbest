import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { trackRedirect, getUserOrders, claimOrder } from '../controllers/order.controller';

const router = Router();

// User tracks affiliate redirect (creating pending order)
router.post('/redirect', requireAuth, trackRedirect);

// User views their tracked/purchased orders
router.get('/', requireAuth, getUserOrders);

// User claims a purchase by providing external Order ID
router.put('/:orderId/claim', requireAuth, claimOrder);

export default router;
