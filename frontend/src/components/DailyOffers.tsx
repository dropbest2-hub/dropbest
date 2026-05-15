'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Clock, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '@/lib/api';

const OFFERS = [
    {
        id: '1',
        title: 'Premium Wireless Headphones',
        discount: '65% OFF',
        price: '₹2,499',
        oldPrice: '₹6,999',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        timer: '04:12:45',
        tag: 'BEST SELLER'
    },
    {
        id: '2',
        title: 'Smart Fitness Watch Pro',
        discount: '40% OFF',
        price: '₹1,899',
        oldPrice: '₹3,199',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        timer: '02:45:10',
        tag: 'FLASH DEAL'
    },
    {
        id: '3',
        title: 'Ultra-Fast GaN Charger',
        discount: '55% OFF',
        price: '₹999',
        oldPrice: '₹2,199',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80',
        timer: '08:20:00',
        tag: 'NEW ARRIVAL'
    },
    {
        id: '4',
        title: 'Mechanical Gaming Keyboard',
        discount: '50% OFF',
        price: '₹3,499',
        oldPrice: '₹6,999',
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80',
        timer: '01:15:30',
        tag: 'LIMITED'
    }
];

export default function DailyOffers() {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('08:00:00');

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
                    // Default 24h cycle if no specific expiry
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

    if (loading) return null;
    if (offers.length === 0) return null;

    return (
        <section className="px-4 sm:px-6 mb-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                            <Zap size={28} fill="currentColor" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                Today's Flash Deals <Sparkles className="text-yellow-500" size={20} />
                            </h2>
                            <p className="text-gray-500 font-bold text-sm italic">Hurry! Deals refreshed every 24 hours</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-900 px-6 py-3 rounded-2xl shadow-xl">
                        <Clock className="text-orange-400" size={20} />
                        <span className="text-white font-black tracking-widest text-lg font-mono">{timeLeft}</span>
                        <span className="text-gray-400 text-[10px] font-black uppercase">Remaining</span>
                    </div>
                </div>

                <div className="flex overflow-x-auto pb-8 gap-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {offers.map((offer) => (
                        <motion.div
                            key={offer.id}
                            whileHover={{ y: -10 }}
                            className="flex-shrink-0 w-72 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-orange-100 transition-all duration-500 overflow-hidden group"
                        >
                            <div className="relative h-56 overflow-hidden">
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

                            <div className="p-6">
                                <h3 className="font-black text-gray-900 mb-2 truncate group-hover:text-orange-600 transition-colors">{offer.title}</h3>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-2xl font-black text-gray-900">₹{offer.price.toLocaleString()}</span>
                                    {offer.old_price && (
                                        <span className="text-sm text-gray-400 line-through font-bold mb-1">₹{offer.old_price.toLocaleString()}</span>
                                    )}
                                </div>
                                <Link 
                                    href={`/products/${offer.id}`}
                                    className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all group-hover:shadow-orange-200"
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

                    {/* View All Card */}
                    <Link href="/daily-deals" className="flex-shrink-0 w-72 flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 p-8 group cursor-pointer hover:border-orange-400 transition-all">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-orange-600 shadow-sm mb-4 transition-colors">
                            <ChevronRight size={32} />
                        </div>
                        <h3 className="font-black text-gray-500 group-hover:text-orange-600 transition-colors">View All Offers</h3>
                    </Link>
                </div>
            </div>
        </section>
    );
}
