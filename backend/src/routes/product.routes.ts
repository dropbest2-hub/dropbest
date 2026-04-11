import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, syncPrices, getProductPriceHistory } from '../controllers/product.controller';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/history', getProductPriceHistory);

// Admin-only routes
router.post('/', requireAdmin, createProduct);
router.post('/sync', requireAdmin, syncPrices);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
