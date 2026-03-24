'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallback() {
    const router = useRouter();
    const { initializeAuth } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { error } = await supabase.auth.getSession();

                if (error) throw error;

                await initializeAuth();
                router.push('/');
            } catch (err: any) {
                console.error('Error during auth callback:', err);
                setError('Authentication failed. Please try again.');
                setTimeout(() => router.push('/auth'), 3000);
            }
        };

        handleCallback();
    }, [router, initializeAuth]);

    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            {error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                    <p className="font-medium text-lg mb-2">{error}</p>
                    <p className="text-sm">Redirecting to login...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-500 mb-4"></div>
                    <p className="text-gray-500 font-medium">Completing sign in...</p>
                </div>
            )}
        </div>
    );
}
