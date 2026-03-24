'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { User as UserIcon, Settings, Package, ExternalLink, Calendar, ChevronRight, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [watchingLoading, setWatchingLoading] = useState(true);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPassword, setEditPassword] = useState('');
    const [editNotifications, setEditNotifications] = useState(user?.notifications_enabled ?? true);
    const [saving, setSaving] = useState(false);

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

            fetchOrders();
            fetchWatchlist();
            setEditName(user.name || '');
            setEditNotifications(user.notifications_enabled ?? true);
        }
    }, [user, router]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Update profile via backend
            const response = await api.put('/users/profile', {
                name: editName,
                notifications_enabled: editNotifications
            });

            // If password is provided, update via Supabase auth directly
            if (editPassword) {
                const { supabase } = await import('@/lib/supabase');
                const { error } = await supabase.auth.updateUser({ password: editPassword });
                if (error) throw error;
                setEditPassword('');
            }

            // Update local Zustand store
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

    const handleRemoveWatch = async (productId: string) => {
        try {
            await api.delete(`/users/watchlist/${productId}`);
            setWatchlist(prev => prev.filter(w => w.product_id !== productId));
        } catch (error) {
            console.error('Error removing from watchlist:', error);
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
 className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center"
 >
 <div className="relative mx-auto w-24 h-24 mb-4">
 {user.avatar_url ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={user.avatar_url}
 alt={user.name || 'User'}
 className="w-full h-full object-cover rounded-full border-4 border-brand-100 shadow-md"
 />
 ) : (
 <div className="w-full h-full bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-3xl font-bold">
 {user.name?.charAt(0) || <UserIcon size={40} />}
 </div>
 )}
 <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
 {user.user_level}
 </div>
 </div>

 <h2 className="text-xl font-bold text-gray-900">{user.name || 'User'}</h2>
 <p className="text-gray-500 text-sm mb-6">{user.email}</p>

 <div className="bg-brand-50 rounded-2xl p-4 flex justify-between items-center mb-6">
 <span className="text-brand-800 font-medium">Badges</span>
 <span className="text-2xl font-black text-brand-600">{user.badge_count}</span>
 </div>

 <button
 onClick={() => setIsSettingsOpen(true)}
 className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-brand-600 border border-gray-200 hover:border-brand-200 hover:bg-brand-50 py-2.5 rounded-xl transition-all text-sm font-medium"
 >
 <Settings size={18} /> Account Settings
 </button>
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
 <div className="p-6 border-b border-gray-100 flex items-center gap-3">
 <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
 <Package size={24} />
 </div>
 <h2 className="text-xl font-bold text-gray-900">Purchase History</h2>
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
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: idx * 0.05 }}
 key={order.id}
 className="p-6 hover:bg-gray-50 transition-colors flex items-center gap-4"
 >
 <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
 {order.products?.image_url && (
 <img src={order.products.image_url} alt="" className="w-full h-full object-cover" />
 )}
 </div>
 <div className="flex-grow">
 <h3 className="font-semibold text-gray-900 line-clamp-1">{order.products?.title || 'Unknown Product'}</h3>
 <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
 <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
 {order.status === 'PENDING' && (
 <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-semibold tracking-wider">PENDING</span>
 )}
 {order.status === 'CONFIRMED' && (
 <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-xs font-semibold tracking-wider">CONFIRMED (+{order.confirmed_badges})</span>
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
 </div>
 </div>

 {/* Settings Modal */}
 {isSettingsOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
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
 </div>
 );
}
