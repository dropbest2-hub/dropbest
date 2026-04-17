import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoldCoinIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 drop-shadow-sm ${className}`}>
        <circle cx="12" cy="12" r="10" fill="url(#goldGradient)" stroke="#D4AF37" strokeWidth="1"/>
        <circle cx="12" cy="12" r="7" fill="none" stroke="#FFE066" strokeWidth="1"/>
        <path d="M12 7V17" stroke="#996515" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 10H14" stroke="#996515" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 14H14" stroke="#996515" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
            <linearGradient id="goldGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFE066" />
                <stop offset="0.5" stopColor="#F5B700" />
                <stop offset="1" stopColor="#D4AF37" />
            </linearGradient>
        </defs>
    </svg>
);

export default function Navbar() {
    const { user, signOut } = useAuthStore();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => pathname === path;

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-1' : 'bg-transparent py-1'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group hover:scale-105 transition-transform duration-300">
                             <img 
                                src="/logo.png" 
                                alt="DropBest!" 
                                className="h-10 sm:h-14 w-auto object-contain drop-shadow-md"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className={`relative py-2 font-medium transition-colors ${isActive('/') ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>
                            Discover
                            {isActive('/') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                        </Link>

                        <Link href="/rewards" className={`relative py-2 font-medium transition-colors ${isActive('/rewards') ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>
                            Rewards
                            {isActive('/rewards') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                        </Link>

                        {user ? (
                            <>
                                <Link href="/rewards" className="flex items-center gap-1.5 text-gray-600 hover:text-brand-600 font-medium transition-colors">
                                    <GoldCoinIcon />
                                    <span className="font-bold text-gray-800">{user.badge_count || 0} Coins</span>
                                </Link>
                                {user.role === 'ADMIN' && (
                                    <Link href="/admin" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg shadow-brand-500/30">
                                        Admin Panel
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                    <Link href="/profile" className="flex items-center gap-2 hover:text-brand-600 transition-colors">
                                        <span className="text-sm font-bold text-gray-700">Hi, {user.name?.split(' ')[0] || user.email.split('@')[0]}</span>
                                    </Link>
                                    <button onClick={signOut} className="text-gray-500 hover:text-red-500 transition-colors">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/auth" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/auth" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg shadow-brand-500/30">
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-brand-600 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t mt-4"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            <Link href="/" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                                Discover Products
                            </Link>

                            <Link href="/rewards" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                                Rewards
                            </Link>

                            {user ? (
                                <>
                                    <Link href="/rewards" className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                                        <GoldCoinIcon />
                                        <span className="font-bold text-gray-800">{user.badge_count || 0} Coins</span>
                                    </Link>
                                    <Link href="/profile" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                                        Profile & Orders
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link href="/admin" className="block px-3 py-3 rounded-md text-base font-medium text-brand-600 bg-brand-50 hover:bg-brand-100">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={signOut}
                                        className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link href="/auth" className="block px-3 py-3 rounded-md text-base font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 mt-4">
                                    Sign In / Register
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
