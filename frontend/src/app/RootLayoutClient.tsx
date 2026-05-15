'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import CustomCursor from '@/components/CustomCursor';
import PWAInstall from '@/components/PWAInstall';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

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
            <PWAInstall />
            <AnimatePresence>
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

            {/* Global Floating Help Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Link 
                        href="/how-to-track" 
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-md text-brand-600 px-5 py-3 rounded-2xl shadow-xl border border-brand-100 font-extrabold text-sm hover:bg-white hover:shadow-brand-500/10 transition-all"
                    >
                        <HelpCircle size={20} className="animate-pulse" /> Tracking Help?
                    </Link>
                </motion.div>
            </div>

            <footer className="bg-brand-50 border-t border-brand-100 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">DropBest!</h3>
                            <div className="space-y-4 text-gray-500 font-medium text-sm leading-relaxed">
                                <p>
                                    <strong>DropBest</strong> is a participant in the Amazon Services LLC Associates Program and the <strong>AbhiBus Affiliate Program</strong>. These programs are designed to provide a means for sites to earn advertising fees by advertising and linking to official stores.
                                </p>
                                <p>
                                    As an Amazon Associate, we earn from qualifying purchases. For bus bookings, we may receive a commission from AbhiBus or RedBus for successful bookings made through our links. This comes at no additional cost to you and often includes exclusive DropBest rewards!
                                </p>
                                <p className="pt-2 text-xs text-gray-400 italic">
                                    Registered Entity: DropBest! Community Platform
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link href="/" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Home</Link></li>
                                <li><Link href="/daily-deals" className="text-gray-600 font-bold hover:text-brand-600 transition-colors flex items-center gap-2">Daily Deals <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">New</span></Link></li>
                                <li><Link href="/discover" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Products</Link></li>
                                <li><Link href="/rewards" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Rewards System</Link></li>
                                <li><a href="/dropbest.apk" download="dropbest.apk" className="text-brand-600 font-black hover:text-brand-700 transition-colors flex items-center gap-1">Download App (APK) ✨</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Legal & Support</h4>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">About Us</Link></li>
                                {useAuthStore.getState().user?.role !== 'ADMIN' && (
                                    <li><Link href="/contact" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Contact Us</Link></li>
                                )}
                                <li><Link href="/privacy-policy" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Terms & Conditions</Link></li>
                                <li><Link href="/disclaimer" className="text-gray-600 font-bold hover:text-brand-600 transition-colors">Affiliate Disclaimer</Link></li>
                            </ul>
                        </div>
                    </div>
                    
                    {/* Mandatory Affiliate Statement */}
                    <div className="mt-12 p-6 bg-white/50 rounded-2xl border border-brand-100/50 text-center">
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
                            <span className="font-bold text-gray-700">Affiliate Disclosure:</span> As an Amazon Associate, DropBest! earns from qualifying purchases. We also participate in affiliate programs with Flipkart, Myntra, Shopsy, Ajio, and travel platforms like AbhiBus and RedBus. Our goal is to provide honest recommendations while earning a small commission to keep this platform free for our community.
                        </p>
                    </div>
                    <div className="pt-8 border-t border-brand-200/50 text-center">
                        <p className="text-gray-500 font-bold text-sm">© {new Date().getFullYear()} DropBest! All rights reserved.</p>
                        <p className="mt-2 text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">Built for the Smart Shopper Community</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
