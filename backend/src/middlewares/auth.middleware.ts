import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' });
            return;
        }

        const token = authHeader.split(' ')[1];

        // DEVELOPMENT BYPASS: Allow mock token for UI testing
        if (token === 'mock-admin-token') {
            const { data: adminUser } = await supabaseAdmin.from('users').select('*').eq('role', 'ADMIN').limit(1).single();
            req.user = { id: adminUser?.id || 'mock-id', email: 'admin@dropbest.com', dbData: adminUser };
            return next();
        }

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Unauthorized', details: error?.message });
            return;
        }

        // Attach user to request
        req.user = user;

        // Use admin client (service role) to bypass RLS — this is safe since it's server-side
        const { data: dbUser, error: dbError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (dbError && dbError.code === 'PGRST116') {
            // User doesn't exist yet, create them
            const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert([{
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url,
                    role: 'USER',
                    badge_count: 0,
                    user_level: 'BRONZE',
                    notifications_enabled: true,
                    referral_code: user.id.split('-')[0].toUpperCase() // Generate code from ID
                }])
                .select()
                .single();

            if (insertError) {
                console.error("Failed to insert user profile in public.users:", insertError);
            } else if (newUser) {
                req.user.dbData = newUser;
            }
        } else if (dbUser) {
            // Check if existing user has a referral code, if not, generate one
            if (!dbUser.referral_code) {
                const newCode = user.id.split('-')[0].toUpperCase();
                const { data: updatedUser } = await supabaseAdmin
                    .from('users')
                    .update({ referral_code: newCode })
                    .eq('id', user.id)
                    .select()
                    .single();
                
                req.user.dbData = updatedUser || dbUser;
            } else {
                req.user.dbData = dbUser;
            }
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // First ensure they are authenticated
    await requireAuth(req, res, () => {
        if (req.user?.dbData?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Forbidden: Admin access required' });
            return;
        }
        next();
    });
};
