'use client';
import { motion } from 'framer-motion';
import { ChevronRight, Award, Zap, Gift, Smartphone, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import BannerCarousel from '@/components/BannerCarousel';
import DailyOffers from '@/components/DailyOffers';
import Link from 'next/link';

export default function HomePage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-12 animate-fade-in pb-20 pt-24">
            {/* Slide 1: Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <section className="text-center py-10 md:py-16 px-6 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    
                    {/* 3D Floating Assets */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 text-white"><Award size={80} /></motion.div>
                        <motion.div animate={{ y: [0, 30, 0], rotate: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-10 text-white"><Zap size={100} /></motion.div>
                        <motion.div animate={{ y: [0, -15, 0], x: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-12 text-white"><Gift size={60} /></motion.div>
                        <motion.div animate={{ y: [0, 20, 0], rotate: [0, 30, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-12 text-white"><Smartphone size={80} /></motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-block px-4 py-1.5 bg-violet-500/20 backdrop-blur-md rounded-full border border-violet-400/30 text-violet-300 text-xs font-black mb-6 uppercase tracking-widest">
                            ✨ Your Community Shopping Hub
                        </div>
                        {user && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-bold text-white mb-4">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 font-black">{user.name || user.email.split('@')[0]}</span> 👋
                            </motion.div>
                        )}
                        <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
                            Smart Shopping. <br />
                            <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-fuchsia-300 bg-clip-text text-transparent italic">Bigger Rewards.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-violet-100 mb-10 max-w-2xl mx-auto font-medium opacity-80">
                            Discover the best deals from top stores, earn exclusive coins, and join a community that shops smarter together.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/discover" className="inline-flex items-center gap-3 bg-white text-violet-900 font-black px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-lg">
                                    Start Exploring <ChevronRight size={22} />
                                </Link>
                            </motion.div>
                            {!user && (
                                <Link href="/auth" className="text-violet-300 font-black hover:text-white transition-colors border-b-2 border-transparent hover:border-violet-300 pb-1">
                                    Join Community
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </section>
            </div>

            {/* Slide 2 & 3: Banner Carousel */}
            <BannerCarousel />

            {/* Shop by Category Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            Browse Categories <Sparkles className="text-yellow-500" size={20} />
                        </h2>
                        <p className="text-gray-500 font-bold text-sm italic">Find exactly what you need in seconds</p>
                    </div>
                    <Link href="/discover" className="text-brand-600 font-black text-sm hover:underline">View All</Link>
                </div>
                <div className="bg-white rounded-[3rem] p-4 shadow-sm border border-gray-100 overflow-hidden">
                     <div className="flex overflow-x-auto no-scrollbar gap-8 py-4 px-4">
                        <Link href="/discover?category=electronics" className="flex flex-col items-center gap-3 group">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Smartphone size={24} />
                            </div>
                            <span className="text-xs font-black text-gray-500 group-hover:text-gray-900">Electronics</span>
                        </Link>
                        <Link href="/discover?category=fashion" className="flex flex-col items-center gap-3 group">
                            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
                                <Zap size={24} />
                            </div>
                            <span className="text-xs font-black text-gray-500 group-hover:text-gray-900">Fashion</span>
                        </Link>
                        <Link href="/discover?category=home" className="flex flex-col items-center gap-3 group">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                                <Gift size={24} />
                            </div>
                            <span className="text-xs font-black text-gray-500 group-hover:text-gray-900">Home</span>
                        </Link>
                        <Link href="/bus-booking" className="flex flex-col items-center gap-3 group">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                <Award size={24} />
                            </div>
                            <span className="text-xs font-black text-gray-500 group-hover:text-gray-900">Bus Tickets</span>
                        </Link>
                     </div>
                </div>
            </section>

            {/* Today's Recommendation: Daily Offers */}
            <DailyOffers />

            {/* Teaser Section for Discover */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Ready to find something specific?</h2>
                <p className="text-gray-500 font-medium mb-10">Our community has curated thousands of verified products just for you.</p>
                <Link href="/discover" className="inline-flex items-center gap-2 text-brand-600 font-black text-xl group">
                    Go to Discover Page <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
