'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
    const { initializeAuth, initialized, loading } = useAuthStore();

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    if (!initialized || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300">
            <Toaster position="top-right" />
            <Navbar />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} DropBest! All rights reserved.</p>
                <p className="mt-2 text-xs">Affiliate Product Review Platform</p>
            </footer>
        </div>
    );
}
