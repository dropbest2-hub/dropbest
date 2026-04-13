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
            <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">DropBest!</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Discover the best products, reviewed by the community. Shop smart and earn rewards for your engagement.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><a href="/" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Home</a></li>
                                <li><a href="/#trending" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Products</a></li>
                                <li><a href="/rewards" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Rewards System</a></li>
                                <li><a href="/leaderboard" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Global Leaderboard</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Legal & Support</h4>
                            <ul className="space-y-2">
                                {useAuthStore.getState().user?.role !== 'ADMIN' && (
                                    <li><a href="/contact" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Contact Us</a></li>
                                )}
                                <li><a href="/privacy-policy" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="/disclaimer" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Affiliate Disclaimer</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-400 font-bold text-sm">© {new Date().getFullYear()} DropBest! All rights reserved.</p>
                        <p className="mt-2 text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">Built for the Smart Shopper Community</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
