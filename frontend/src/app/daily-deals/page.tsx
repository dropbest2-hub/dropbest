'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Clock, Sparkles, TrendingUp, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/lib/api';

export default function DailyDealsPage() {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('00:00:00');

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const res = await axios.get(`${API_URL}/products`);
                const deals = res.data.filter((p: any) => p.is_daily_deal);
                setOffers(deals);

                // Find earliest expiry for the global timer
                const expiries = deals.map((d: any) => d.deal_expires_at).filter(Boolean);
                if (expiries.length > 0) {
                    const earliest = new Date(Math.min(...expiries.map((e: any) => new Date(e).getTime())));
                    startTimer(earliest);
                } else {
                    const tomorrow = new Date();
                    tomorrow.setHours(23, 59, 59);
                    startTimer(tomorrow);
                }
            } catch (err) {
                console.error('Failed to fetch deals', err);
            } finally {
                setLoading(false);
            }
        };

        const startTimer = (targetDate: Date) => {
            const updateTimer = () => {
                const now = new Date();
                const diff = targetDate.getTime() - now.getTime();
                
                if (diff <= 0) {
                    setTimeLeft('00:00:00');
                    return;
                }

                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        };

        fetchDeals();
    }, []);

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Header */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50 -z-10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl -ml-48 -mb-48" />

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-6"
                    >
                        <Zap size={14} fill="currentColor" /> Flash Deals Active
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight"
                    >
                        Today's <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent italic">Flash Deals</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 max-w-2xl mx-auto font-medium"
                    >
                        Hand-picked community deals with massive discounts. These offers expire soon, so grab them while they last!
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 inline-flex items-center gap-6 bg-gray-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-orange-500/20"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Next Refresh In</span>
                            <span className="text-3xl font-black font-mono tracking-tighter">{timeLeft}</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <Clock size={32} className="text-orange-400 animate-pulse" />
                    </motion.div>
                </div>
            </section>

            {/* Deals Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] h-[450px] animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <Zap size={64} className="mx-auto text-gray-200 mb-6" />
                        <h2 className="text-3xl font-black text-gray-900 mb-4">No Active Flash Deals</h2>
                        <p className="text-gray-500 font-medium">Check back later for new community-picked deals!</p>
                        <Link href="/discover" className="mt-8 inline-flex items-center gap-2 text-orange-600 font-black hover:gap-4 transition-all">
                            Explore All Products <ChevronRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {offers.map((offer, idx) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-orange-100 transition-all duration-500 overflow-hidden"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <Image 
                                        src={offer.image_url} 
                                        alt={offer.title} 
                                        fill 
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        unoptimized
                                    />
                                    <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                                        <TrendingUp size={12} className="text-green-400" /> {offer.deal_tag || 'FLASH DEAL'}
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-orange-600 text-white font-black px-4 py-2 rounded-xl shadow-xl text-xs">
                                        {offer.deal_discount_text || 'GREAT DEAL'}
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="font-black text-gray-900 mb-3 text-lg line-clamp-2 group-hover:text-orange-600 transition-colors h-14">
                                        {offer.title}
                                    </h3>
                                    <div className="flex items-end gap-3 mb-8">
                                        <span className="text-3xl font-black text-gray-900">₹{offer.price.toLocaleString()}</span>
                                        {offer.old_price && (
                                            <span className="text-sm text-gray-400 line-through font-bold mb-1.5">₹{offer.old_price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <Link 
                                        href={`/products/${offer.id}`}
                                        className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all group-hover:shadow-orange-200"
                                    >
                                        {offer.amazon_link ? 'Buy on Amazon' : 
                                         offer.flipkart_link ? 'Buy on Flipkart' : 
                                         offer.myntra_link ? 'Buy on Myntra' : 
                                         offer.ajio_link ? 'Buy on Ajio' : 
                                         offer.shopsy_link ? 'Buy on Shopsy' : 'View Deal'} 
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Newsletter / CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-32">
                <div className="bg-gradient-to-br from-violet-900 to-indigo-900 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Never miss a price drop again.</h2>
                        <p className="text-violet-200 text-lg mb-10 max-w-xl mx-auto font-medium">Join 10,000+ smart shoppers and get real-time alerts for the best deals across all major stores.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth" className="bg-white text-violet-900 px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">
                                Get Started for Free
                            </Link>
                            <Link href="/rewards" className="text-white font-black hover:text-violet-300 transition-colors">
                                Learn about Rewards
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
