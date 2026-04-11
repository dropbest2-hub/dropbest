'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import CustomCursor from '@/components/CustomCursor';

export default function RootLayoutClient({ children }: { children: ReactNode }) {
    const { initializeAuth, initialized, loading } = useAuthStore();
    const pathname = usePathname();

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
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 transition-colors duration-300 overflow-x-hidden">
            <CustomCursor />
            <Toaster position="top-right" />
            <Navbar />
            <AnimatePresence mode="wait">
                <motion.main 
                    key={pathname}
                    initial={{ opacity: 0, rotateX: 10, y: 20 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: -10, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full origin-top"
                    style={{ perspective: '1200px' }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
            <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} DropBest! All rights reserved.</p>
                <p className="mt-2 text-xs">Affiliate Product Review Platform</p>
            </footer>
        </div>
    );
}
