'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PackagePlus, CheckSquare, XCircle, Plus, Edit2, Trash2, Award, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface AdminOrder {
    id: string;
    created_at: string;
    purchase_value?: number;
    users?: { email: string; name: string | null };
    products?: { title: string };
}

interface AdminProduct {
    id: string;
    title: string;
    description: string;
    price: number | string;
    image_url: string;
}

interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
    user_level: string;
    badge_count: number;
    created_at: string;
    avatar_url: string | null;
}

export default function AdminDashboard() {
  const { user, session } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users'>('orders');

  // Data State
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

 // Forms
 const [rejectionMessage, setRejectionMessage] = useState<Record<string, string>>({});
 const [purchaseValue, setPurchaseValue] = useState<Record<string, string>>({});
 const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', image_url: '', amazon_link: '', flipkart_link: '' });
 const [isAddingProduct, setIsAddingProduct] = useState(false);
 const [isSyncing, setIsSyncing] = useState(false);

 const is40DaysPassed = (dateString: string) => {
 const createdDate = new Date(dateString);
 const fortyDaysInMs = 40 * 24 * 60 * 60 * 1000;
 return (new Date().getTime() - createdDate.getTime()) >= fortyDaysInMs;
 };

 useEffect(() => {
 if (!useAuthStore.getState().loading) {
 if (!user || user.role !== 'ADMIN') {
 router.push('/');
 return;
 }
 }

 if (user && user.role === 'ADMIN' && session) {
 fetchData();
 }
 }, [user, session, router]);

 const fetchData = async () => {
 setLoading(true);
 try {
 // Fetch Products
 const prodRes = await axios.get(`${API_URL}/products`);
 setProducts(prodRes.data);

 // Fetch Pending Orders (using Supabase directly for Admin since we didn't expose a dedicated GET pending route in the Express backend blueprint, though we can query the public table or add a route. Actually, for speed, we query Supabase directly for Admin pending orders).
 const { data: ordersData, error: ordersError } = await supabase
 .from('orders')
 .select(`*, users ( email, name ), products ( title )`)
 .eq('status', 'PENDING')
 .order('created_at', { ascending: true });

 if (ordersError) throw ordersError;
 setPendingOrders(ordersData || []);

 // Fetch All Users (Requires new DB policy)
 const { data: usersData, error: usersError } = await supabase
 .from('users')
 .select('*')
 .order('created_at', { ascending: false });
 
 if (!usersError) {
 setUsersList(usersData || []);
 }

 } catch (error) {
 console.error('Failed to fetch admin data', error);
 } finally {
 setLoading(false);
 }
 };

 const handleConfirmOrder = async (orderId: string) => {
 try {
 const val = parseFloat(purchaseValue[orderId]);
 if (isNaN(val) || val < 300) {
 alert("Purchase value must be at least ₹300 to earn badges. If it's less, the system technically rejects it or gives 0 badges.");
 return;
 }

 await axios.post(
 `${API_URL}/admin/orders/${orderId}/confirm`,
 { purchaseValue: val },
 { headers: { Authorization: `Bearer ${session?.access_token}` } }
 );

 setPendingOrders(prev => prev.filter(o => o.id !== orderId));
 alert('Order confirmed and badges awarded!');
  } catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to confirm order';
  alert(message);
  }
 };

 const handleRejectOrder = async (orderId: string) => {
 const msg = rejectionMessage[orderId] || '';
 if (!confirm(`Are you sure you want to reject this order? ${msg ? `Message: "${msg}"` : 'The user will get a default message.'}`)) return;
 try {
 await axios.post(
 `${API_URL}/admin/orders/${orderId}/reject`,
 { message: msg },
 { headers: { Authorization: `Bearer ${session?.access_token}` } }
 );
 setPendingOrders(prev => prev.filter(o => o.id !== orderId));
 setRejectionMessage(prev => {
 const updated = { ...prev };
 delete updated[orderId];
 return updated;
 });
  } catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to reject order';
  alert(message);
  }
 };

 const handleAddProduct = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await axios.post(
 `${API_URL}/products`,
 { ...newProduct, price: parseFloat(newProduct.price) },
 { headers: { Authorization: `Bearer ${session?.access_token}` } }
 );
 setIsAddingProduct(false);
 setNewProduct({ title: '', description: '', price: '', image_url: '', amazon_link: '', flipkart_link: '' });
 fetchData();
 } catch (error) {
 alert('Failed to add product');
 }
 };

 const handleDeleteProduct = async (productId: string) => {
 if (!confirm('Delete this product entirely?')) return;
 try {
 await axios.delete(
 `${API_URL}/products/${productId}`,
 { headers: { Authorization: `Bearer ${session?.access_token}` } }
 );
 setProducts(prev => prev.filter(p => p.id !== productId));
 } catch (error) {
 alert('Failed to delete product');
 }
 };

 const handleSyncPrices = async () => {
 if (!confirm('This will scrape Amazon/Flipkart for all products. It might take a minute. Continue?')) return;
 
 setIsSyncing(true);
 try {
 const response = await axios.post(
 `${API_URL}/products/sync`,
 {},
 { headers: { Authorization: `Bearer ${session?.access_token}` } }
 );
 
 alert(`Sync Successful! Updated ${response.data.updated.length} products.`);
 fetchData();
  } catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to sync prices';
  alert(message);
  } finally {
 setIsSyncing(false);
 }
 };

 if (!user || user.role !== 'ADMIN') return null;

 return (
 <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 animate-fade-in">

 {/* Sidebar */}
 <div className="w-full md:w-64 flex-shrink-0">
 <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 sticky top-24">
 {/* Sidebar header */}
 <div className="bg-gradient-to-br from-violet-700 to-purple-600 p-6">
 <div className="flex items-center gap-3">
 <div className="bg-white/20 p-2 rounded-xl">
 <LayoutDashboard size={20} className="text-white" />
 </div>
 <div>
 <h2 className="text-white font-black text-lg leading-tight">DropBest!</h2>
 <p className="text-violet-200 text-xs font-medium">Admin Dashboard</p>
 </div>
 </div>
 </div>

 <div className="p-4 space-y-1">
 <button
 onClick={() => setActiveTab('orders')}
 className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'orders' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 <span className="flex items-center gap-2"><CheckSquare size={18} /> Confirmations</span>
 {pendingOrders.length > 0 && (
 <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
 )}
 </button>
 <button
 onClick={() => setActiveTab('products')}
 className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'products' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 <PackagePlus size={18} /> Manage Products
 </button>
 <button
 onClick={() => setActiveTab('users')}
 className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
 Registered Users
 </button>
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="flex-grow min-w-0">
 {!loading && (
 <motion.div 
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between"
 >
 <div>
 <h1 className="text-2xl font-black text-gray-900">Welcome back, {user.name || user.email.split('@')[0]}!</h1>
 <p className="text-sm text-gray-500 font-medium">Here&apos;s what&apos;s happening across the platform today.</p>
 </div>
 <div className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl text-xs font-bold uppercase tracking-widest border border-violet-100">
 System Admin
 </div>
 </motion.div>
 )}

 {loading ? (
 <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px] flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
 </div>
 ) : (
 <AnimatePresence mode="wait">
 {activeTab === 'orders' && (
 <motion.div
 key="orders"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
 >
 <h3 className="text-2xl font-bold text-gray-900 mb-2">40-Day Purchase Confirmations</h3>
 <p className="text-gray-500 mb-8">Review pending affiliate clicks. If 40 days have passed and a purchase is confirmed, award badges by entering the purchase value.</p>

 {pendingOrders.length === 0 ? (
 <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
 <CheckSquare size={48} className="mx-auto text-gray-300 mb-4" />
 <p className="text-gray-500 font-medium">No pending orders to confirm.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {pendingOrders.map(order => (
 <div key={order.id} className="border border-gray-200 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:border-brand-200 transition-colors">
 <div>
 <p className="text-xs text-brand-600 font-bold mb-1 uppercase tracking-wider">Order #{order.id.split('-')[0]}</p>
 <h4 className="font-bold text-gray-900 text-lg mb-1">{order.products?.title}</h4>
 <p className="text-sm text-gray-500">User: <span className="font-medium text-gray-700">{order.users?.email}</span></p>
 <p className="text-sm text-gray-500">Tracked On: {new Date(order.created_at).toLocaleDateString()}</p>
 </div>

 <div className="flex flex-col gap-3 w-full lg:w-auto">
 <div className="flex flex-col sm:flex-row items-center gap-3">
 <div className="flex flex-col gap-1 w-full sm:w-48">
 <input
 type="number"
 placeholder="Purchase value (₹)"
 className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 w-full focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
 value={purchaseValue[order.id] || ''}
 onChange={(e) => setPurchaseValue(prev => ({ ...prev, [order.id]: e.target.value }))}
 />
 {is40DaysPassed(order.created_at) && (
 <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-bold text-center">Ready for Confirmation (40+ Days)</span>
 )}
 </div>
 <div className="flex gap-2 w-full sm:w-auto">
 <button
 onClick={() => handleConfirmOrder(order.id)}
 className="flex-1 sm:flex-none bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-95"
 >
 Confirm
 </button>
 <button
 onClick={() => handleRejectOrder(order.id)}
 className="flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-100 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95"
 title="Reject with Message"
 >
 <XCircle size={20} />
 </button>
 </div>
 </div>
 <input
 placeholder="Rejection Reason (Optional Message to User)"
 className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-300 outline-none transition-all"
 value={rejectionMessage[order.id] || ''}
 onChange={(e) => setRejectionMessage(prev => ({ ...prev, [order.id]: e.target.value }))}
 />
 </div>
 </div>
 ))}
 </div>
 )}
 </motion.div>
 )}

 {activeTab === 'products' && (
 <motion.div
 key="products"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
 >
 <div className="flex justify-between items-center mb-8">
 <div>
 <h3 className="text-2xl font-bold text-gray-900 mb-1">Manage Products</h3>
 <p className="text-gray-500">Add or remove products from the directory.</p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={handleSyncPrices}
 disabled={isSyncing}
 className="flex items-center gap-2 px-5 py-2.5 bg-brand-100 text-brand-700 rounded-xl font-bold hover:bg-brand-200 transition-all disabled:opacity-50"
 >
 <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : ''} />
 {isSyncing ? 'Syncing...' : 'Sync Prices'}
 </button>
 <button
 onClick={() => setIsAddingProduct(!isAddingProduct)}
 className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
 >
 {isAddingProduct ? 'Cancel' : <><Plus size={18} /> Add Product</>}
 </button>
 </div>
 </div>

 <AnimatePresence>
 {isAddingProduct && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden mb-8"
 >
 <form onSubmit={handleAddProduct} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <input required placeholder="Product Title" className="p-3 rounded-xl border" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} />
 <input required type="number" placeholder="Price (₹)" className="p-3 rounded-xl border" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
 <input required placeholder="Image URL" className="p-3 rounded-xl border md:col-span-2" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} />
 <textarea required placeholder="Product Description..." className="p-3 rounded-xl border md:col-span-2" rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
 <input required placeholder="Amazon Affiliate URL" className="p-3 rounded-xl border" value={newProduct.amazon_link} onChange={e => setNewProduct({ ...newProduct, amazon_link: e.target.value })} />
 <input placeholder="Flipkart Affiliate URL (Optional)" className="p-3 rounded-xl border" value={newProduct.flipkart_link} onChange={e => setNewProduct({ ...newProduct, flipkart_link: e.target.value })} />
 </div>
 <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl">Save Product</button>
 </form>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
 {products.map(product => (
 <div key={product.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm group">
 <div className="h-32 bg-gray-50 relative overflow-hidden">
 <Image src={product.image_url} alt="" width={300} height={128} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
 <div className="absolute top-2 right-2 flex gap-1">
 <button onClick={() => handleDeleteProduct(product.id)} className="bg-white/90 p-1.5 rounded-lg text-red-500 hover:bg-red-50 backdrop-blur shadow"><Trash2 size={16} /></button>
 </div>
 </div>
 <div className="p-4 bg-white">
 <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.title}</h4>
 <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
 <p className="font-bold text-brand-600">₹{product.price}</p>
 </div>
 </div>
 ))}
 </div>

 </motion.div>
 )}

 {activeTab === 'users' && (
 <motion.div
 key="users"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
 >
 <h3 className="text-2xl font-bold text-gray-900 mb-2">Registered Users</h3>
 <p className="text-gray-500 mb-8">View all active users on the platform, their roles, and current badge counts.</p>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="py-4 px-4 font-bold text-gray-900">User</th>
 <th className="py-4 px-4 font-bold text-gray-900">Email</th>
 <th className="py-4 px-4 font-bold text-gray-900">Role</th>
 <th className="py-4 px-4 font-bold text-gray-900">Level</th>
 <th className="py-4 px-4 font-bold text-gray-900">Badges</th>
 <th className="py-4 px-4 font-bold text-gray-900">Joined</th>
 </tr>
 </thead>
 <tbody>
 {usersList.length === 0 ? (
 <tr>
 <td colSpan={6} className="py-8 text-center text-gray-500">
 No users found or lack permission to read users table.
 </td>
 </tr>
 ) : (
 usersList.map((usr) => (
 <tr key={usr.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
 <td className="py-4 px-4">
 <div className="flex items-center gap-3">
 {usr.avatar_url ? (
 <img src={usr.avatar_url} alt="" className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
 ) : (
 <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shadow-inner">
 {usr.name?.charAt(0) || usr.email?.charAt(0) || '?'}
 </div>
 )}
 <span className="font-semibold text-gray-900">{usr.name || 'No Name'}</span>
 </div>
 </td>
 <td className="py-4 px-4 text-gray-600 font-medium">{usr.email}</td>
 <td className="py-4 px-4">
 <span className={`text-xs font-black px-2 py-1 rounded-full ${usr.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
 {usr.role}
 </span>
 </td>
 <td className="py-4 px-4">
 <span className="text-xs font-black px-2 py-1 rounded-full bg-brand-50 text-brand-700">
 {usr.user_level}
 </span>
 </td>
 <td className="py-4 px-4">
 <div className="flex items-center gap-1.5 font-bold text-gray-900">
 <Award size={16} className="text-brand-500" /> {usr.badge_count}
 </div>
 </td>
 <td className="py-4 px-4 text-gray-500 text-sm">
 {new Date(usr.created_at).toLocaleDateString()}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 )}
 </div>
 </div>
 );
}
