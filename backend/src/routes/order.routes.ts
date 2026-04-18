import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { trackRedirect, getUserOrders, claimOrder, deleteOrder } from '../controllers/order.controller';

const router = Router();

// User tracks affiliate redirect (creating pending order)
router.post('/redirect', requireAuth, trackRedirect);

// User views their tracked/purchased orders
router.get('/', requireAuth, getUserOrders);

// User claims a purchase by providing external Order ID
router.put('/:orderId/claim', requireAuth, claimOrder);

// User cancels/deletes a pending tracking entry
router.delete('/:orderId', requireAuth, deleteOrder);

export default router;
