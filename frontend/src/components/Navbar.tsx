import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2.5 group hover:scale-105 transition-transform duration-300">
                            <img 
                                src="/logo.png" 
                                alt="DropBest!" 
                                className="h-12 sm:h-20 w-auto object-contain drop-shadow-md transform scale-[1.2] sm:scale-[2.2] origin-left"
                                onError={(e) => {
                                    // Fallback to text if image not placed yet
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<span class="font-black text-xl tracking-tight bg-gradient-to-r from-violet-700 via-purple-600 to-pink-500 bg-clip-text text-transparent">DropBest!</span>';
                                }}
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className={`relative py-2 font-medium transition-colors ${isActive('/') ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>
                            Discover
                            {isActive('/') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                        </Link>

                        {user?.role !== 'ADMIN' && (
                            <Link href="/rewards" className={`relative py-2 font-medium transition-colors ${isActive('/rewards') ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>
                                Rewards
                                {isActive('/rewards') && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                            </Link>
                        )}

                        {user ? (
                            <>
                                {user.role !== 'ADMIN' && (
                                    <Link href="/rewards" className="flex items-center gap-1 text-gray-600 hover:text-brand-600 font-medium transition-colors">
                                        <Award size={18} />
                                        <span>{user.badge_count} Badges</span>
                                    </Link>
                                )}
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

                            {user?.role !== 'ADMIN' && (
                                <Link href="/rewards" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                                    Rewards
                                </Link>
                            )}

                            {user ? (
                                <>
                                {user.role !== 'ADMIN' && (
                                    <Link href="/rewards" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600">
                                        My Rewards ({user.badge_count} Badges)
                                    </Link>
                                )}
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
