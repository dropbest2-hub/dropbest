'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Ticket, ArrowRight, CheckCircle2, AlertCircle, ShoppingBag, Sparkles, Zap, Gift, Copy, ChevronRight, Gem, MousePointer2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ScratchCard from '@/components/ScratchCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Rewards() {
    const { user, session, initializeAuth } = useAuthStore();
    const router = useRouter();
    const [rewards, setRewards] = useState([]);
    const [scratchCards, setScratchCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);
    const [activeTab, setActiveTab] = useState<'shop' | 'history'>('shop');

    useEffect(() => {
        if (!user && !useAuthStore.getState().loading) {
            router.push('/auth');
            return;
        }

        if (user && session) {
            fetchRewards();
            fetchScratchCards();
        }
    }, [user?.id, session?.access_token, router]);

    const fetchRewards = async () => {
        try {
            const response = await axios.get(`${API_URL}/rewards`, {
                headers: { Authorization: `Bearer ${useAuthStore.getState().session?.access_token}` }
            });
            setRewards(response.data);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchScratchCards = async () => {
        try {
            const response = await axios.get(`${API_URL}/rewards/scratch-cards`, {
                headers: { Authorization: `Bearer ${useAuthStore.getState().session?.access_token}` }
            });
            setScratchCards(response.data.filter((c: any) => c.status === 'PENDING'));
        } catch (error) {
            console.error('Error fetching scratch cards:', error);
        }
    };

    const handleConvert = async (amount: 110 | 220) => {
        try {
            setConverting(true);
            const token = useAuthStore.getState().session?.access_token;

            await axios.post(
                `${API_URL}/rewards/convert`,
                { badgesToUse: amount },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`Successfully redeemed ${amount} badges!`, {
                icon: '🎉',
                style: { borderRadius: '15px', background: '#333', color: '#fff' }
            });
            
            await initializeAuth();
            await fetchRewards();
            setActiveTab('history');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to redeem badges');
        } finally {
            setConverting(false);
        }
    };

    const handleScratchComplete = async (id: string) => {
        try {
            const token = useAuthStore.getState().session?.access_token;
            const response = await axios.post(
                `${API_URL}/rewards/scratch-cards/${id}/claim`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(response.data.message);
            await initializeAuth();
            setScratchCards(prev => prev.filter(c => c.id !== id));
        } catch (error: any) {
            toast.error('Failed to claim coins');
        }
    };

    const handleCoinRedeem = async () => {
        try {
            setConverting(true);
            const token = useAuthStore.getState().session?.access_token;
            await axios.post(
                `${API_URL}/rewards/convert-coins`,
                { coinAmount: 1000 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Converted 1000 coins to ₹10 coupon!');
            await initializeAuth();
            await fetchRewards();
            setActiveTab('history');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to convert coins');
        } finally {
            setConverting(false);
        }
    };

    if (!user) return null;

    const nextMilestone = user.badge_count < 100 ? 100 : user.badge_count < 300 ? 300 : user.badge_count < 700 ? 700 : 1000;
    const progress = (user.badge_count / nextMilestone) * 100;

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20 animate-fade-in">
            {/* Header Hero */}
            <header className="relative py-12 mb-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 text-white shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 px-8 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-violet-100 text-sm font-bold mb-4"
                        >
                            <Sparkles size={16} /> Elite Rewards Program
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Reward Shop</h1>
                        <p className="text-violet-100 text-lg max-w-md font-medium">
                            Your style has value. Convert your earned badges and coins into real-world shopping power.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-inner flex flex-col items-center min-w-[280px]">
                        <p className="text-violet-200 text-sm font-bold uppercase tracking-widest mb-1">Badge Count</p>
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="text-yellow-400" size={32} />
                            <span className="text-4xl font-black tracking-tighter">{user.badge_count}</span>
                        </div>
                        
                        <div className="w-full h-px bg-white/20 mb-4" />

                        <p className="text-violet-200 text-sm font-bold uppercase tracking-widest mb-1">Coin Balance</p>
                        <div className="flex items-center gap-3">
                            <Gem className="text-brand-300" size={32} />
                            <span className="text-4xl font-black tracking-tighter">{user.coin_count || 0}</span>
                        </div>
                        <p className="text-[10px] text-white/50 font-bold mt-1 uppercase">100 Coins = ₹1</p>
                    </div>
                </div>
            </header>

            {/* Scratch Cards Section - EXCLUSIVE REVEAL */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                        <MousePointer2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mystery Scratch Cards</h2>
                        <p className="text-gray-500 text-sm font-medium">Revealed only after confirmed purchases!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {scratchCards.length > 0 ? (
                        scratchCards.map((card) => (
                            <ScratchCard 
                                key={card.id}
                                id={card.id}
                                coins={card.coins_rewarded}
                                onComplete={handleScratchComplete}
                            />
                        ))
                    ) : (
                        <ScratchCard 
                            id="locked"
                            coins={0}
                            isLocked={true}
                            onComplete={() => {}}
                        />
                    )}
                </div>
            </section>

            <div className="w-full h-px bg-gray-100 mb-16" />

            {/* Navigation Tabs */}
            <div className="flex items-center justify-center gap-4 mb-10">
                <button 
                    onClick={() => setActiveTab('shop')}
                    className={`px-8 py-3 rounded-2xl font-black transition-all ${activeTab === 'shop' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                >
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={20} /> Convert Rewards
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-8 py-3 rounded-2xl font-black transition-all ${activeTab === 'history' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
                >
                    <div className="flex items-center gap-2">
                        <Ticket size={20} /> My Coupons
                    </div>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'shop' ? (
                    <motion.div 
                        key="shop"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {/* Coin Redeem Tier */}
                        <div className="group relative bg-white rounded-[2.5rem] p-8 border-2 border-brand-500 shadow-xl scale-105 z-10">
                            <div className="absolute top-6 right-6 text-brand-100">
                                <Gem size={80} />
                            </div>
                            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl mb-6 flex items-center justify-center">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Coin Wallet Redeem</h3>
                            <p className="text-gray-500 font-medium mb-8">Exchange your scratch card winnings for shopping power.</p>
                            
                            <div className="flex items-center justify-between py-6 border-y border-gray-50 mb-8">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Value</p>
                                    <p className="text-3xl font-black text-gray-900">₹10 OFF</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cost</p>
                                    <p className="text-3xl font-black text-brand-600">1000 <span className="text-sm uppercase">coins</span></p>
                                </div>
                            </div>

                            <button
                                onClick={handleCoinRedeem}
                                disabled={converting || (user.coin_count || 0) < 1000}
                                className="w-full py-4 rounded-2xl bg-brand-600 text-white font-black hover:bg-brand-700 transition-all disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center gap-3"
                            >
                                {converting ? 'Processing...' : (user.coin_count || 0) < 1000 ? 'Need more coins' : 'Redeem 1000 Coins'}
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Badge Tier 1 */}
                        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl mb-6 flex items-center justify-center">
                                <Gift size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Basic Voucher</h3>
                            <p className="text-gray-500 font-medium mb-8">Standard badge redemption for quick savings.</p>
                            
                            <div className="flex items-center justify-between py-6 border-y border-gray-50 mb-8">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Value</p>
                                    <p className="text-3xl font-black text-gray-900">₹10 OFF</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cost</p>
                                    <p className="text-3xl font-black text-green-600">110 <span className="text-sm">badges</span></p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleConvert(110)}
                                disabled={converting || user.badge_count < 110}
                                className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-black transition-all disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center gap-3"
                            >
                                {converting ? 'Processing...' : user.badge_count < 110 ? 'Need 110 Badges' : 'Redeem Now'}
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Badge Tier 2 */}
                        <div className="group relative bg-gradient-to-br from-violet-600 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-xl hover:shadow-violet-500/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                                <Ticket size={180} />
                            </div>
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6 flex items-center justify-center">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Elite Savings</h3>
                            <p className="text-violet-100 font-medium mb-8">The most efficient way to use your earned badges.</p>
                            
                            <div className="flex items-center justify-between py-6 border-y border-white/20 mb-8">
                                <div>
                                    <p className="text-xs font-bold text-violet-200 uppercase tracking-widest text-opacity-70">Value</p>
                                    <p className="text-3xl font-black">₹20 OFF</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-violet-200 uppercase tracking-widest text-opacity-70">Cost</p>
                                    <p className="text-3xl font-black text-yellow-300">220 <span className="text-sm">badges</span></p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleConvert(220)}
                                disabled={converting || user.badge_count < 220}
                                className="w-full py-4 rounded-2xl bg-white text-violet-700 font-black hover:bg-violet-50 transition-all disabled:bg-white/30 disabled:text-white/50 flex items-center justify-center gap-3 shadow-xl"
                            >
                                {converting ? 'Processing...' : user.badge_count < 220 ? 'Need 220 Badges' : 'Redeem Now'}
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {rewards.length === 0 ? (
                            <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-gray-100 text-center">
                                <div className="bg-gray-50 p-8 rounded-full w-fit mx-auto mb-6">
                                    <Ticket size={48} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">Your wallet is empty</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto">Convert your badges or coins to see your exclusive coupon codes here.</p>
                                <button onClick={() => setActiveTab('shop')} className="mt-8 text-violet-600 font-black uppercase tracking-widest text-sm hover:underline">Go to Shop</button>
                            </div>
                        ) : (
                            rewards.map((reward: any, idx) => (
                                <motion.div
                                    key={reward.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all border-l-8 border-l-violet-600"
                                >
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 text-violet-600 font-black text-lg mb-1">
                                                    <Ticket size={24} />
                                                    SHOPPING COUPON
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Level Reward - ₹{reward.reward_amount} Credit</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-violet-600 transition-colors">
                                                <Copy 
                                                    size={20} 
                                                    className="cursor-pointer" 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(reward.coupon_code);
                                                        toast.success('Code copied to clipboard!');
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="relative h-20 group/scratch cursor-pointer scratch-reveal rounded-2xl overflow-hidden shadow-inner bg-gray-900 border-4 border-gray-800">
                                            {/* Revealed Content */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-violet-600/5">
                                                <code className="text-2xl font-black text-white tracking-[0.4em] font-mono">
                                                    {reward.coupon_code}
                                                </code>
                                            </div>
                                            
                                            {/* Scratch Mask (Covers the content until hover) */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center transition-all duration-500 group-hover/scratch:opacity-0 scratch-mask">
                                                <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Hover to reveal</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-center text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-[0.2em]">
                                            {reward.badges_used > 0 ? `Deducted ${reward.badges_used} Badges` : 'Exchanged Coins'} • {new Date(reward.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    
                                    {/* Decorative circles for coupon look */}
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-100"></div>
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-100"></div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
