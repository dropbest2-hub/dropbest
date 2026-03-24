import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// This route just allows the frontend to verify a token is valid 
// and returns the user object we populated in requireAuth
router.get('/me', requireAuth, (req: Request, res: Response) => {
    res.json({
        user: req.user?.dbData
    });
});

export default router;
