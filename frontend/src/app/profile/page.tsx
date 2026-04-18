'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Settings, Package, ExternalLink, Calendar, ChevronRight, Eye, EyeOff, Trash2, Award, Gem, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const BadgeCrystal3D = ({ count, level }: { count: number, level: string }) => {
    return (
        <div className="relative group perspective-1000 py-4">
            <motion.div
                animate={{ 
                    rotateY: [0, 360],
                    rotateX: [15, 25, 15]
                }}
                transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                className="relative w-32 h-32 mx-auto"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* 3D Crystal Simulation using multiple layers */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-indigo-400 rounded-2xl opacity-40 blur-md scale-110"></div>
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/40 flex flex-col items-center justify-center shadow-2xl" style={{ transform: 'translateZ(20px)' }}>
                    <Gem className="text-white drop-shadow-lg mb-1" size={32} />
                    <span className="text-3xl font-black text-white drop-shadow-md">{count}</span>
                </div>
                {/* Back side or extra depth */}
                <div className="absolute inset-0 bg-brand-800/40 rounded-2xl" style={{ transform: 'translateZ(-20px) rotateY(180deg)' }}></div>
            </motion.div>
            
            <div className="mt-4 text-center">
                <span className="bg-brand-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/20 shadow-xl uppercase tracking-[0.2em]">
                    {level} Status
                </span>
            </div>
            
            {/* Animated Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-brand-500/40 transition-all duration-500"></div>
        </div>
    );
};

export default function Profile() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [watchingLoading, setWatchingLoading] = useState(true);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [referralsLoading, setReferralsLoading] = useState(true);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPassword, setEditPassword] = useState('');
    const [editNotifications, setEditNotifications] = useState(user?.notifications_enabled ?? true);
    const [saving, setSaving] = useState(false);
    const [referralCodeInput, setReferralCodeInput] = useState('');
    const [applyingReferral, setApplyingReferral] = useState(false);

    // Claim Modal State
    const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
    const [externalOrderId, setExternalOrderId] = useState('');
    const [claimValue, setClaimValue] = useState('');
    const [submittingClaim, setSubmittingClaim] = useState(false);

    useEffect(() => {
        if (!user && !useAuthStore.getState().loading) {
            router.push('/auth');
            return;
        }

        if (user) {
            const fetchOrders = async () => {
                try {
                    const response = await api.get('/orders');
                    setOrders(response.data);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                } finally {
                    setLoading(false);
                }
            };

            const fetchWatchlist = async () => {
                try {
                    const response = await api.get('/users/watchlist');
                    setWatchlist(response.data);
                } catch (error) {
                    console.error('Error fetching watchlist:', error);
                } finally {
                    setWatchingLoading(false);
                }
            };

            const fetchReferrals = async () => {
                try {
                    const response = await api.get('/users/referrals');
                    setReferrals(response.data);
                } catch (error) {
                    console.error('Error fetching referrals:', error);
                } finally {
                    setReferralsLoading(false);
                }
            };

            fetchOrders();
            fetchWatchlist();
            fetchReferrals();
            setEditName(user.name || '');
            setEditNotifications(user.notifications_enabled ?? true);
        }
    }, [user, router]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/users/profile', {
                name: editName,
                notifications_enabled: editNotifications
            });

            if (editPassword) {
                const { supabase } = await import('@/lib/supabase');
                const { error } = await supabase.auth.updateUser({ password: editPassword });
                if (error) throw error;
                setEditPassword('');
            }

            useAuthStore.getState().setUser(response.data);
            setIsSettingsOpen(false);
            const { toast } = await import('react-hot-toast');
            toast.success('Settings updated successfully!');
        } catch (error: any) {
            console.error('Failed to update settings', error);
            const { toast } = await import('react-hot-toast');
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleApplyReferral = async () => {
        if (!referralCodeInput) return;
        setApplyingReferral(true);
        try {
            const response = await api.post('/users/referral/apply', { referralCode: referralCodeInput });
            const { toast } = await import('react-hot-toast');
            toast.success(response.data.message);
            const profileRes = await api.get('/users/profile');
            useAuthStore.getState().setUser(profileRes.data);
            setReferralCodeInput('');
        } catch (error: any) {
            const { toast } = await import('react-hot-toast');
            toast.error(error.response?.data?.error || 'Failed to apply referral code');
        } finally {
            setApplyingReferral(false);
        }
    };

    const handleRemoveWatch = async (productId: string) => {
        try {
            await api.delete(`/users/watchlist/${productId}`);
            setWatchlist(prev => prev.filter(w => w.product_id !== productId));
        } catch (error) {
            console.error('Error removing from watchlist:', error);
        }
    };

    const handleSubmitClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claimingOrderId) return;
        setSubmittingClaim(true);
        try {
            await api.put(`/orders/${claimingOrderId}/claim`, {
                externalOrderId: externalOrderId,
                purchaseValue: parseFloat(claimValue)
            });
            const { toast } = await import('react-hot-toast');
            toast.success('Order details submitted! Admin will verify and award coins soon.');
            setClaimingOrderId(null);
            setExternalOrderId('');
            setClaimValue('');
            // Refresh orders
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error: any) {
            const { toast } = await import('react-hot-toast');
            toast.error(error.response?.data?.error || 'Failed to submit claim');
        } finally {
            setSubmittingClaim(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Hello, {user.name || user.email.split('@')[0]}! 👋</h1>
                <p className="text-gray-500 font-medium">Manage your reviews, rewards, and account settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - User Info */}
                <div className="md:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden group"
                    >
                        {/* 3D Crystal Badge Component */}
                        <BadgeCrystal3D count={user.badge_count} level={user.user_level} />

                        <div className="mt-10 pt-6 border-t border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">{user.name || 'User'}</h2>
                            <p className="text-gray-500 text-sm mb-6">{user.email}</p>

                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-brand-600 border border-gray-200 hover:border-brand-200 hover:bg-brand-50 py-2.5 rounded-xl transition-all text-sm font-medium"
                            >
                                <Settings size={18} /> Account Settings
                            </button>
                        </div>
                    </motion.div>

                    {/* Referral Program Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group hover:rotate-2 transition-all duration-500"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Award size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="text-xl font-black mb-2 flex items-center gap-2">Refer & Earn! 🎁</h3>
                            <p className="text-brand-50 text-xs font-medium mb-6">Refer 1 friend who completes 3 purchases to get 25 coins!</p>
                            
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-full border border-white/20 mb-6 group-hover:scale-105 transition-transform">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-100 mb-2">Your Referral Code</p>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl font-black tracking-widest">{user.referral_code || '---'}</span>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(user.referral_code || '');
                                            import('react-hot-toast').then(({ toast }) => toast.success('Code copied!'));
                                        }}
                                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>

                            {!user.referred_by_id && (
                                <div className="w-full space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="Enter Friend's Code" 
                                        value={referralCodeInput}
                                        onChange={(e) => setReferralCodeInput(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm placeholder:text-white/50 outline-none focus:bg-white/20 transition-all text-center uppercase"
                                    />
                                    <button 
                                        onClick={handleApplyReferral}
                                        disabled={applyingReferral || !referralCodeInput}
                                        className="w-full bg-white text-brand-600 font-bold py-2 rounded-xl hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {applyingReferral ? 'Applying...' : 'Apply Code'}
                                    </button>
                                </div>
                            )}
                            {user.referred_by_id && (
                                <div className="flex items-center justify-center gap-2 text-xs font-bold bg-white/20 px-4 py-2 rounded-full border border-white/10">
                                    <Calendar size={14} /> Referral Applied
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Activity */}
                <div className="md:col-span-2 space-y-8">
                    {/* Orders */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                                    <Package size={24} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 leading-tight">Live Order Tracker 📦</h2>
                            </div>
                            <div className="hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Real-time Status
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-8 space-y-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <p>No tracked purchases yet.</p>
                                <p className="text-sm mt-2">Click external links on products to start tracking!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {orders.map((order: any, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={order.id}
                                        className="p-6 hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                            {/* Product Info Left */}
                                            <div className="flex items-center gap-4 min-w-[200px]">
                                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm p-1">
                                                    {order.products?.image_url && (
                                                        <img src={order.products.image_url} alt="" className="w-full h-full object-contain" />
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">{order.products?.title || 'Unknown Product'}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Tracked on {new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* Progress Tracker Center */}
                                            <div className="flex-grow w-full">
                                                <div className="relative h-1 bg-gray-100 rounded-full mb-4">
                                                    {/* Progress Fill */}
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: order.status === 'CONFIRMED' ? '100%' : order.external_order_id ? '50%' : '15%' }}
                                                        className={`absolute top-0 left-0 h-full rounded-full ${order.status === 'CONFIRMED' ? 'bg-brand-500' : 'bg-amber-400'}`}
                                                    />
                                                    
                                                    {/* Step Dots */}
                                                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-0.5 pointer-events-none">
                                                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${order.status ? 'bg-brand-500' : 'bg-gray-200'}`} />
                                                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${order.external_order_id ? 'bg-amber-400' : 'bg-gray-200'}`} />
                                                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${order.status === 'CONFIRMED' ? 'bg-brand-500' : 'bg-gray-200'}`} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest px-1">
                                                    <span className="text-brand-600">Ordered</span>
                                                    <span className={order.external_order_id ? 'text-amber-500' : 'text-gray-300'}>Verifying</span>
                                                    <span className={order.status === 'CONFIRMED' ? 'text-brand-600' : 'text-gray-300'}>Coins Released</span>
                                                </div>
                                            </div>

                                            {/* Action Right */}
                                            <div className="shrink-0 flex items-center justify-end w-full sm:w-auto">
                                                {order.status === 'PENDING' && !order.external_order_id ? (
                                                    <button 
                                                        onClick={() => setClaimingOrderId(order.id)}
                                                        className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-black px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all"
                                                    >
                                                        I'VE ORDERED THIS
                                                    </button>
                                                ) : order.status === 'CONFIRMED' ? (
                                                    <div className="flex items-center gap-1.5 text-brand-600 font-black text-xs">
                                                        <Gem size={14} /> +{order.confirmed_badges} EARNED
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-amber-500 font-black text-[10px] uppercase tracking-wider animate-pulse">
                                                        In Progress...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Watchlist */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3 text-fuchsia-600">
                            <div className="bg-fuchsia-100 p-2 rounded-xl">
                                <Eye size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Price Watchlist</h2>
                        </div>

                        {watchingLoading ? (
                            <div className="p-8 space-y-4">
                                <div className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>
                            </div>
                        ) : watchlist.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <EyeOff size={48} className="mx-auto text-gray-300 mb-4" />
                                <p>Your watchlist is empty.</p>
                                <p className="text-sm mt-2">Watch products on the home page to track price drops!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {watchlist.map((item: any, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={item.id}
                                        className="p-6 hover:bg-gray-50 transition-colors flex items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.products?.image_url && (
                                                <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">{item.products?.title || 'Unknown Product'}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm font-bold text-brand-600">
                                                ₹{item.products?.price.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => handleRemoveWatch(item.product_id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove from watchlist"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Referrals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3 text-emerald-600">
                            <div className="bg-emerald-100 p-2 rounded-xl">
                                <Users size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Friends Referred</h2>
                        </div>

                        {referralsLoading ? (
                            <div className="p-8 space-y-4">
                                <div className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
                            </div>
                        ) : referrals.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                <p>No friends referred yet.</p>
                                <p className="text-sm mt-2">Share your code to earn bonus coins!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {referrals.map((friend: any, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={friend.id}
                                        className="p-6 hover:bg-gray-50 transition-colors flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
                                            {friend.avatar_url ? (
                                                <img src={friend.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                friend.name?.[0] || 'U'
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-gray-900">{friend.name || 'Anonymous User'}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Calendar size={12} /> Joined {new Date(friend.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                                            Success
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, rotateY: -20 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.95, rotateY: 20 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 origin-center"
                            style={{ perspective: '1000px' }}
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only)</label>
                                    <input type="text" value={user.email} disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl px-4 py-3 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={editPassword}
                                        onChange={(e) => setEditPassword(e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl px-4 py-3 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-500">Receive order updates</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditNotifications(!editNotifications)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editNotifications ? 'bg-brand-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsSettingsOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-md shadow-brand-500/20 disabled:opacity-70"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Claim Reward Modal */}
            <AnimatePresence>
                {claimingOrderId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 leading-tight">Claim Coins 🤑</h2>
                                    <p className="text-xs text-gray-500 font-medium">Have you purchased this product?</p>
                                </div>
                                <button onClick={() => setClaimingOrderId(null)} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleSubmitClaim} className="p-6 space-y-5">
                                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                                    <p className="text-xs text-brand-700 leading-relaxed font-medium">
                                        Enter your Order ID from Amazon/Flipkart/Myntra so we can verify with the merchant and award your coins!
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order ID / Transaction ID</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Paste your order ID here"
                                        value={externalOrderId}
                                        onChange={(e) => setExternalOrderId(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl px-4 py-3 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Purchase Amount (₹)</label>
                                    <input 
                                        required
                                        type="number" 
                                        placeholder="Exact amount paid"
                                        value={claimValue}
                                        onChange={(e) => setClaimValue(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl px-4 py-3 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setClaimingOrderId(null)}
                                        className="flex-1 px-4 py-3 border border-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-50 text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingClaim || !externalOrderId || !claimValue}
                                        className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black shadow-lg shadow-brand-500/20 disabled:opacity-70 transition-all text-sm"
                                    >
                                        {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
