'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, MapPin, Calendar, Users, ChevronRight, Star, ExternalLink, ShieldCheck, Clock, Zap, AlertCircle, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';

interface BusListing {
    id: string;
    title: string;
    description: string;
    price: number;
    old_price?: number;
    external_rating?: number;
    external_review_count?: number;
    image_url: string;
    search_keywords?: string;
    amazon_link?: string;
}

export default function BusBookingPage() {
    const [buses, setBuses] = useState<BusListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBuses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/products?category=bus-booking');
            setBuses(response.data);
        } catch (err: any) {
            setError('Failed to fetch bus listings. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBuses();
    }, [fetchBuses]);

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <main className="pt-24 pb-20">
                {/* Hero Section */}
                <section className="px-6 mb-12">
                    <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-orange-600 via-orange-500 to-red-500 p-8 md:p-16">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-32" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="max-w-2xl text-center md:text-left">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold mb-6"
                                >
                                    <Zap size={16} className="text-yellow-300" />
                                    <span>FLAT 40% OFF ON FIRST BOOKING</span>
                                </motion.div>
                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
                                >
                                    Travel Better, <br />
                                    <span className="text-orange-100">Earn More.</span>
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-orange-50 text-lg md:text-xl font-medium mb-10 opacity-90"
                                >
                                    Book your favorite bus routes via DropBest & get exclusive coins on every ticket.
                                </motion.p>

                                {/* Search Box Mockup */}
                                <div className="bg-white p-4 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">
                                    <div className="flex-1 w-full relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                                        <input type="text" placeholder="From City" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold" readOnly value="Bangalore" />
                                    </div>
                                    <div className="bg-orange-100 p-3 rounded-full hidden md:block">
                                        <RefreshCcw className="text-orange-600" size={20} />
                                    </div>
                                    <div className="flex-1 w-full relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                                        <input type="text" placeholder="To City" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none font-bold" readOnly value="Chennai" />
                                    </div>
                                    <button className="w-full md:w-auto bg-black text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-transform">
                                        SEARCH
                                    </button>
                                </div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="hidden lg:block relative"
                            >
                                <div className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3rem] border border-white/20 shadow-2xl">
                                    <Bus size={200} className="text-white drop-shadow-3xl" strokeWidth={0.5} />
                                </div>
                                <div className="absolute -top-6 -right-6 bg-yellow-400 text-black font-black px-6 py-3 rounded-2xl shadow-xl -rotate-12 animate-pulse">
                                    TRUSTED PARTNERS
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Available Routes</h2>
                                <p className="text-gray-500 font-medium italic">Handpicked luxury bus options for your journey</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex -space-x-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                            <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="User" width={40} height={40} />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 font-bold self-center">1.2k+ Users Booked Today</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-6">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-48 bg-gray-200 rounded-[2rem] animate-pulse" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-red-100">
                                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
                                <p className="text-gray-500 mb-6">{error}</p>
                                <button onClick={fetchBuses} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold">Try Again</button>
                            </div>
                        ) : buses.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100">
                                <Bus className="mx-auto text-gray-300 mb-4" size={64} />
                                <h3 className="text-2xl font-black text-gray-900 uppercase">Admin team will add soon</h3>
                                <p className="text-gray-500 mt-2 font-medium">We're currently preparing new bus routes for you. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {buses.map((bus) => {
                                    // Parse extra info: Partner|Duration|Source|Dest|Time|Seats
                                    const parts = bus.search_keywords ? bus.search_keywords.split('|') : [];
                                    const duration = parts[1] || '08h 45m';
                                    const source = parts[2] || 'Source City';
                                    const destination = parts[3] || 'Dest City';
                                    const timeRange = parts[4] || '21:30 - 06:15';
                                    const [departure, arrival] = timeRange.split(' - ');
                                    const seatsLeft = parts[5] || '12 Seats Left';
                                    const savings = bus.old_price ? bus.old_price - bus.price : 0;

                                    return (
                                        <motion.div 
                                            key={bus.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            className="group relative bg-white rounded-[2rem] border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
                                        >
                                            {/* Main Ticket Info */}
                                            <div className="flex-grow p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                                {/* Operator & Type */}
                                                <div className="w-full md:w-64">
                                                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{bus.title}</h3>
                                                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">{bus.description}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-lg text-xs font-black">
                                                            <Star size={10} fill="currentColor" /> {bus.external_rating || '4.2'}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                            {bus.external_review_count || '288'} Reviews
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Journey Visualizer */}
                                                <div className="flex-1 flex items-center justify-between gap-6 w-full">
                                                    <div className="text-left">
                                                        <p className="text-2xl font-black text-gray-900 leading-none mb-1">{departure}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{source}</p>
                                                    </div>

                                                    <div className="flex-1 flex flex-col items-center">
                                                        <span className="text-[10px] text-gray-400 font-black uppercase mb-2">{duration}</span>
                                                        <div className="w-full h-px bg-gray-200 relative">
                                                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="bg-white px-3 py-1 rounded-full border border-gray-100 text-[10px] font-black text-gray-400">
                                                                    BUS
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-gray-900 leading-none mb-1">{arrival}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{destination}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price & Action Section */}
                                            <div className="md:w-72 bg-gray-50/50 border-l border-gray-100 p-6 md:p-8 flex flex-col justify-center items-center md:items-end gap-6">
                                                <div className="text-center md:text-right">
                                                    <div className="flex items-center justify-center md:justify-end gap-2 mb-1">
                                                        {savings > 0 && (
                                                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-md">SAVE ₹{savings}</span>
                                                        )}
                                                        {bus.old_price && (
                                                            <span className="text-sm text-gray-400 line-through font-bold">₹{bus.old_price}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Fare starts from</span>
                                                        <span className="text-3xl font-black text-gray-900">₹{bus.price}</span>
                                                    </div>
                                                </div>

                                                <div className="w-full">
                                                    <a 
                                                        href={bus.amazon_link || '#'} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="block w-full bg-orange-600 text-white text-center py-4 rounded-2xl font-black shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:scale-[1.02] transition-all active:scale-95"
                                                    >
                                                        SELECT SEATS
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Partners Section */}
                <section className="px-6 mt-20">
                    <div className="max-w-7xl mx-auto text-center">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Our Booking Partners</h3>
                        <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {['RedBus', 'AbhiBus', 'ZingBus', 'MakeMyTrip'].map(partner => (
                                <div key={partner} className="font-black text-2xl text-gray-400">{partner}</div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
