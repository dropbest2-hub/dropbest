'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PackagePlus, CheckSquare, XCircle, Plus, Edit2, Trash2, Award, RefreshCcw, MessageSquare, Bus, MapPin, Clock, Zap, Star as StarIcon, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import AdminDailyDeals from '@/components/AdminDailyDeals';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface AdminOrder {
    id: string;
    created_at: string;
    purchase_value?: number;
    users?: { email: string; name: string | null };
    products?: { title: string };
    external_order_id?: string;
}

interface AdminProduct {
    id: string;
    title: string;
    description: string;
    price: number | string;
    old_price?: number | string;
    external_rating?: number;
    external_review_count?: number;
    image_url: string;
    category?: string;
    amazon_link?: string;
    flipkart_link?: string;
    myntra_link?: string;
    shopsy_link?: string;
    ajio_link?: string;
    search_keywords?: string;
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
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'messages' | 'payouts' | 'bus_routes' | 'daily_deals' | 'sync_reports'>('orders');

  // Data State
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [utrInput, setUtrInput] = useState<Record<string, string>>({});
  const [isSendingReply, setIsSendingReply] = useState(false);

 // Forms
 const [rejectionMessage, setRejectionMessage] = useState<Record<string, string>>({});
 const [purchaseValue, setPurchaseValue] = useState<Record<string, string>>({});
 const [manualCoins, setManualCoins] = useState<Record<string, string>>({});
 const [newProduct, setNewProduct] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    old_price: '',
    external_rating: '',
    external_review_count: '',
    image_url: '', 
    amazon_link: '', 
    flipkart_link: '', 
    myntra_link: '', 
    shopsy_link: '', 
    ajio_link: '', 
    category: 'electronics', 
    search_keywords: '' 
  });
 const [isAddingProduct, setIsAddingProduct] = useState(false);
 const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [isBusBulkImporting, setIsBusBulkImporting] = useState(false);
  const [bulkJson, setBulkJson] = useState('');

  // Bus Route specific form state
  const [busForm, setBusForm] = useState({
      partner: '',
      title: '', // Bus Operator Name
      description: 'NON-AC Seater/Sleeper', // Bus Type
      duration: '',
      source: '',
      destination: '',
      departure_time: '',
      arrival_time: '',
      price: '',
      old_price: '',
      rating: '4.2',
      review_count: '288',
      link: '',
      promo_code: ''
  });


 const is40DaysPassed = (dateString: string) => {
 const createdDate = new Date(dateString);
 const fortyDaysInMs = 40 * 24 * 60 * 60 * 1000;
 return (new Date().getTime() - createdDate.getTime()) >= fortyDaysInMs;
 };

 useEffect(() => {
  // Load Price Sync Results
  const savedSync = localStorage.getItem('price_sync_results');
  if (savedSync) {
    const { results, timestamp } = JSON.parse(savedSync);
    const hoursPassed = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (hoursPassed < 24) {
      setSyncResults(results.filter((r: any) => r.old !== r.new));
    } else {
      localStorage.removeItem('price_sync_results');
    }
  }

 if (!useAuthStore.getState().loading) {
 if (!user || user.role !== 'ADMIN') {
 router.push('/');
 return;
 }
 }

 if (user && user.role === 'ADMIN' && session) {
 fetchData();
 }
 }, [user?.id, session?.access_token, router]);

 const fetchData = async () => {
 setLoading(true);
 try {
 // Fetch Products
 const prodRes = await axios.get(`${API_URL}/products`);
 setProducts(prodRes.data);

 // Fetch Pending Orders
 const ordersRes = await axios.get(`${API_URL}/admin/orders`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
 setPendingOrders(ordersRes.data || []);

 // Fetch All Users (Requires new DB policy)
 const { data: usersData, error: usersError } = await supabase
 .from('users')
 .select('*')
 .order('created_at', { ascending: false });
 
 if (!usersError) {
 setUsersList(usersData || []);
 }

 // Fetch Messages
 try {
    const msgRes = await axios.get(`${API_URL}/contacts`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
    setMessages(msgRes.data || []);
 } catch(err) {
    console.log('Messages table may not exist yet or failed to fetch');
 }

 // Fetch Payouts
 try {
    const payRes = await axios.get(`${API_URL}/admin/payouts`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
    setPayouts(payRes.data || []);
 } catch(err) {
    console.log('Payouts failed to fetch', err);
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
  const coinsVal = manualCoins[orderId] ? parseInt(manualCoins[orderId]) : null;

  if (isNaN(val)) {
  alert("Please enter a valid Purchase value.");
  return;
  }

  await axios.post(
  `${API_URL}/admin/orders/${orderId}/confirm`,
  { purchaseValue: val, coins: coinsVal },
  { headers: { Authorization: `Bearer ${session?.access_token}` } }
  );

 setPendingOrders(prev => prev.filter(o => o.id !== orderId));
 alert('Order confirmed and coins awarded!');
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
 if (!newProduct.amazon_link && !newProduct.flipkart_link && !newProduct.myntra_link && !newProduct.shopsy_link && !newProduct.ajio_link) {
     alert("Please provide at least one link (Amazon, Flipkart, Myntra, Shopsy, or Ajio).");
     return;
 }
 try {
     if (editingProductId) {
         await axios.put(
             `${API_URL}/products/${editingProductId}`,
             { 
                 ...newProduct, 
                 price: parseFloat(newProduct.price.toString()),
                 old_price: newProduct.old_price ? parseFloat(newProduct.old_price.toString()) : null,
                 external_rating: newProduct.external_rating ? parseFloat(newProduct.external_rating.toString()) : null,
                 external_review_count: newProduct.external_review_count ? parseInt(newProduct.external_review_count.toString()) : null
             },
             { headers: { Authorization: `Bearer ${session?.access_token}` } }
         );
     } else {
          await axios.post(
              `${API_URL}/products`,
              { 
                  ...newProduct, 
                  price: parseFloat(newProduct.price.toString()),
                  old_price: newProduct.old_price ? parseFloat(newProduct.old_price.toString()) : null,
                  external_rating: newProduct.external_rating ? parseFloat(newProduct.external_rating.toString()) : null,
                  external_review_count: newProduct.external_review_count ? parseInt(newProduct.external_review_count.toString()) : null
              },
              { headers: { Authorization: `Bearer ${session?.access_token}` } }
          );
     }
 setIsAddingProduct(false);
 setEditingProductId(null);
 setNewProduct({ title: '', description: '', price: '', old_price: '', external_rating: '', external_review_count: '', image_url: '', amazon_link: '', flipkart_link: '', myntra_link: '', shopsy_link: '', ajio_link: '', category: 'electronics', search_keywords: '' });
 fetchData();
 } catch (error) {
 alert('Failed to save product');
 }
 };

 const handleEditProduct = (product: AdminProduct) => {
     setNewProduct({
         title: product.title || '',
         description: product.description || '',
         price: product.price ? product.price.toString() : '',
         image_url: product.image_url || '',
         amazon_link: product.amazon_link || '',
         flipkart_link: product.flipkart_link || '',
         myntra_link: product.myntra_link || '',
         shopsy_link: product.shopsy_link || '',
         ajio_link: product.ajio_link || '',
         category: product.category || 'electronics',
         search_keywords: product.search_keywords || '',
         old_price: product.old_price ? product.old_price.toString() : '',
         external_rating: product.external_rating ? product.external_rating.toString() : '',
         external_review_count: product.external_review_count ? product.external_review_count.toString() : ''
     });
     setEditingProductId(product.id);
     setIsAddingProduct(true);
     window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleDeleteFromSync = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    try {
        await axios.delete(
            `${API_URL}/products/${productId}`,
            { headers: { Authorization: `Bearer ${session?.access_token}` } }
        );
        setSyncResults(prev => prev.filter(p => p.id !== productId));
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
        
        const changedOnly = (response.data.updated || []).filter((r: any) => r.old !== r.new);
        setSyncResults(changedOnly);
        localStorage.setItem('price_sync_results', JSON.stringify({ results: changedOnly, timestamp: Date.now() }));
        setShowSyncModal(true);
        fetchData();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to sync prices';
        alert(message);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleBulkImport = async (forceCategory?: string) => {
    if (!bulkJson.trim()) return;
    try {
        let data = JSON.parse(bulkJson);
        if (!Array.isArray(data)) data = [data];

        // Force category if provided (for Bus Routes tab)
        if (forceCategory) {
            data = data.map((item: any) => ({ ...item, category: forceCategory }));
        }

        const response = await axios.post(
            `${API_URL}/products/bulk-import`,
            data,
            { headers: { Authorization: `Bearer ${session?.access_token}` } }
        );
        alert(response.data.message);
        setBulkJson('');
        setIsBulkImporting(false);
        setIsBusBulkImporting(false);
        fetchData();
    } catch (err: any) {
        alert('Bulk Import Failed: ' + (err.response?.data?.error || err.message || 'Invalid JSON format'));
    }
  };

  const handleSendReply = async (messageId: string, userEmail: string) => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
        await axios.post(
            `${API_URL}/contacts/reply`,
            { messageId, userEmail, replyText },
            { headers: { Authorization: `Bearer ${session?.access_token}` } }
        );
        alert('Reply sent to user email successfully!');
        setReplyingTo(null);
        setReplyText('');
        fetchData(); // Refresh to show new status
    } catch (error) {
        alert('Failed to send reply');
    } finally {
        setIsSendingReply(false);
    }
  };

  const handleApprovePayout = async (id: string) => {
      const utr = utrInput[id];
      if (!utr) {
          alert('Please enter a UTR Number/Transaction ID to mark as paid.');
          return;
      }
      try {
          await axios.post(`${API_URL}/admin/payouts/${id}/approve`, { utrNumber: utr }, { headers: { Authorization: `Bearer ${session?.access_token}` } });
          alert('Payout approved successfully!');
          fetchData();
      } catch (e: any) {
          alert(e.response?.data?.error || 'Failed to approve payout');
      }
  };

  const handleRejectPayout = async (id: string) => {
      if (!confirm('Are you sure you want to reject this payout and refund the wallet?')) return;
      try {
          await axios.post(`${API_URL}/admin/payouts/${id}/reject`, {}, { headers: { Authorization: `Bearer ${session?.access_token}` } });
          alert('Payout rejected and amount refunded to user wallet!');
          fetchData();
      } catch (e: any) {
          alert(e.response?.data?.error || 'Failed to reject payout');
      }
  };

  const handleAddBusRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const busData = {
            title: busForm.title,
            description: busForm.description,
            price: parseFloat(busForm.price),
            old_price: busForm.old_price ? parseFloat(busForm.old_price) : null,
            category: 'bus-booking',
            image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=200', // Placeholder
            external_rating: parseFloat(busForm.rating),
            external_review_count: parseInt(busForm.review_count),
            search_keywords: `${busForm.partner} ${busForm.source} ${busForm.destination} ${busForm.title}`,
            amazon_link: busForm.link,
            // In a real app, these would be separate columns. 
            // For now we might store them in a JSON field or use keywords.
            // But based on previous implementation, we likely added them to the products table.
        };

        const { data, error } = await supabase.from('products').insert([busData]).select();
        if (error) throw error;
        
        alert('Bus Route Added Successfully!');
        setBusForm({
            partner: '', title: '', description: 'NON-AC Seater/Sleeper',
            duration: '', source: '', destination: '',
            departure_time: '', arrival_time: '',
            price: '', old_price: '', rating: '4.2',
            review_count: '288', link: '', promo_code: ''
        });
        fetchData();
    } catch (err: any) {
        alert('Error adding bus route: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteBusRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
        await axios.delete(`${API_URL}/products/${id}`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
        setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
        alert('Error deleting route: ' + err.message);
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
 User Registrations
 </button>
  <button
  onClick={() => setActiveTab('messages')}
  className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'messages' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
  >
  <MessageSquare size={18} /> User Messages
  </button>
  <button
  onClick={() => setActiveTab('bus_routes')}
  className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'bus_routes' ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}
  >
  <Bus size={18} /> Bus Routes
  </button>
 <button
 onClick={() => setActiveTab('daily_deals')}
 className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'daily_deals' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 <Zap size={18} /> Daily Deals
 </button>
 <button
 onClick={() => setActiveTab('sync_reports')}
 className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'sync_reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 <span className="flex items-center gap-2"><RefreshCcw size={18} /> Price Sync Reports</span>
 {syncResults.length > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">New</span>}
 </button>
 <button
 onClick={() => setActiveTab('payouts')}
 className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'payouts' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
 >
 <span className="flex items-center gap-2">💰 Payout Requests</span>
 {payouts.filter(p => p.status === 'PENDING').length > 0 && (
 <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">{payouts.filter(p => p.status === 'PENDING').length}</span>
 )}
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
  className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  >
  <div>
  <h1 className="text-xl sm:text-2xl font-black text-gray-900">Welcome back, {user.name || user.email.split('@')[0]}!</h1>
  <p className="text-xs sm:text-sm text-gray-500 font-medium">Here&apos;s what&apos;s happening across the platform today.</p>
  </div>
  <div className="px-4 py-2 bg-violet-50 text-violet-700 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-violet-100 shrink-0">
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
 <p className="text-gray-500 mb-8">Review pending affiliate clicks. If 40 days have passed and a purchase is confirmed, award coins by entering the purchase value.</p>

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
 {order.external_order_id && (
      <div className="mt-2 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg">
          <p className="text-[10px] font-black text-brand-700 uppercase tracking-widest leading-none mb-1">User Provided Order ID</p>
          <p className="text-sm font-bold text-gray-900">{order.external_order_id}</p>
      </div>
  )}
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
 <input
 type="number"
 placeholder="Coins (Optional Override)"
 className="border border-gray-200 bg-white rounded-xl px-4 py-2.5 w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all mt-1"
 value={manualCoins[order.id] || ''}
 onChange={(e) => setManualCoins(prev => ({ ...prev, [order.id]: e.target.value }))}
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
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
 <div>
 <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Manage Products</h3>
 <p className="text-sm text-gray-500">Add or remove products from the directory.</p>
 </div>
 <div className="flex flex-wrap gap-2 w-full sm:w-auto">
 <button
 onClick={handleSyncPrices}
 disabled={isSyncing}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-brand-100 text-brand-700 rounded-xl font-bold hover:bg-brand-200 transition-all disabled:opacity-50 text-sm"
 >
 <RefreshCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
 {isSyncing ? 'Syncing...' : 'Sync Prices'}
 </button>
 <button
 onClick={() => {
     if (isAddingProduct) {
         setIsAddingProduct(false);
         setEditingProductId(null);
         setNewProduct({ title: '', description: '', price: '', old_price: '', external_rating: '', external_review_count: '', image_url: '', amazon_link: '', flipkart_link: '', myntra_link: '', shopsy_link: '', ajio_link: '', category: 'electronics', search_keywords: '' });
     } else {
         setIsAddingProduct(true);
         setIsBulkImporting(false);
     }
 }}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
 >
 {isAddingProduct ? 'Cancel' : <><Plus size={16} /> Add Product</>}
 </button>
 <button
 onClick={() => {
     setIsBulkImporting(!isBulkImporting);
     setIsAddingProduct(false);
 }}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
 >
 <PackagePlus size={16} /> {isBulkImporting ? 'Cancel' : 'Bulk Import'}
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
 <input required placeholder="Searching Product Name (Keywords)" className="p-3 rounded-xl border" value={newProduct.search_keywords} onChange={e => setNewProduct({ ...newProduct, search_keywords: e.target.value })} />
 <input required type="number" placeholder="Price (₹)" className="p-3 rounded-xl border" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
 <input required placeholder="Image URL" className="p-3 rounded-xl border md:col-span-2" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} />
 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-[-10px] mb-2 md:col-span-2">
      Tip: You can use local images like <span className="text-brand-600">/shopsy.webp</span> or <span className="text-brand-600">/Ajio.webp</span> from the public folder.
  </p>
 <textarea required placeholder="Product Description..." className="p-3 rounded-xl border md:col-span-2" rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
 <input placeholder="Amazon Affiliate URL (Optional)" className="p-3 rounded-xl border" value={newProduct.amazon_link} onChange={e => setNewProduct({ ...newProduct, amazon_link: e.target.value })} />
 <input placeholder="Flipkart Affiliate URL (Optional)" className="p-3 rounded-xl border" value={newProduct.flipkart_link} onChange={e => setNewProduct({ ...newProduct, flipkart_link: e.target.value })} />
 <input placeholder="Myntra Affiliate URL (Optional)" className="p-3 rounded-xl border" value={newProduct.myntra_link} onChange={e => setNewProduct({ ...newProduct, myntra_link: e.target.value })} />
 <input placeholder="Shopsy Affiliate URL (Optional)" className="p-3 rounded-xl border" value={newProduct.shopsy_link} onChange={e => setNewProduct({ ...newProduct, shopsy_link: e.target.value })} />
 <input placeholder="Ajio Affiliate URL (Optional)" className="p-3 rounded-xl border" value={newProduct.ajio_link} onChange={e => setNewProduct({ ...newProduct, ajio_link: e.target.value })} />
 <select required className="p-3 rounded-xl border md:col-span-2 bg-white" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
     {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'bus-booking').map(category => (
         <option key={category.id} value={category.id}>{category.name}</option>
     ))}
 </select>

 {newProduct.category === 'bus-booking' && (
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
          <div className="md:col-span-3">
              <h4 className="text-sm font-black text-orange-800 uppercase tracking-widest mb-2">Bus Details (Custom Fields)</h4>
              <p className="text-[10px] text-orange-600 font-bold mb-4">Use 'Keywords' field to enter: Partner|Duration|Source|Dest|Time|Seats (e.g. RedBus|06h 20m|Gobichettipalayam|Bangalore|23:25 - 05:45|31 Seats Left)</p>
          </div>
          <input placeholder="Original Price (₹)" className="p-3 rounded-xl border bg-white" type="number" value={newProduct.old_price} onChange={e => setNewProduct({ ...newProduct, old_price: e.target.value })} />
          <input placeholder="Rating (e.g. 3.6)" className="p-3 rounded-xl border bg-white" type="number" step="0.1" value={newProduct.external_rating} onChange={e => setNewProduct({ ...newProduct, external_rating: e.target.value })} />
          <input placeholder="Review Count (e.g. 288)" className="p-3 rounded-xl border bg-white" type="number" value={newProduct.external_review_count} onChange={e => setNewProduct({ ...newProduct, external_review_count: e.target.value })} />
      </div>
  )}
 </div>
 <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl">
     {editingProductId ? 'Update Product' : 'Save Product'}
 </button>
 </form>
 </motion.div>
 )}
 </AnimatePresence>

  <AnimatePresence>
 {isBulkImporting && (
     <motion.div
         initial={{ height: 0, opacity: 0 }}
         animate={{ height: 'auto', opacity: 1 }}
         exit={{ height: 0, opacity: 0 }}
         className="overflow-hidden mb-8"
     >
         <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
             <h4 className="text-lg font-black text-blue-900 mb-2">Bulk JSON Import</h4>
             <p className="text-sm text-blue-700 mb-4 font-medium">
                 Paste a JSON array of products. Format: 
                 <code className="bg-white/50 px-2 py-0.5 rounded ml-1 text-xs">
                     [{"{ \"title\": \"Bus 1\", \"price\": 500, \"category\": \"bus-booking\", ... }"}]
                 </code>
             </p>
             <textarea 
                 className="w-full p-4 rounded-xl border border-blue-200 bg-white font-mono text-xs mb-4" 
                 rows={10} 
                 placeholder='[ { "title": "Example Bus", "price": 450, "category": "bus-booking" } ]'
                 value={bulkJson}
                 onChange={e => setBulkJson(e.target.value)}
             />
             <div className="flex gap-3">
                 <button 
                     onClick={() => handleBulkImport()}
                     className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-600/20"
                 >
                     IMPORT ALL
                 </button>
                 <button 
                     onClick={() => {
                         const template = [
                             {
                                 title: "Bus Operator Name",
                                 description: "Non-AC Seater/Sleeper",
                                 price: 350,
                                 old_price: 399,
                                 category: "bus-booking",
                                 amazon_link: "https://affiliate-link.com",
                                 search_keywords: "Partner|Duration|Source|Dest|Time|Seats",
                                 image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"
                             }
                         ];
                         setBulkJson(JSON.stringify(template, null, 2));
                     } }
                     className="px-6 bg-white border border-blue-200 text-blue-600 font-bold rounded-xl"
                 >
                     Load Template
                 </button>
             </div>
         </div>
     </motion.div>
 )}
 </AnimatePresence>

 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
 {products.filter(p => p.category !== 'bus-booking').map(product => (
 <div key={product.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm group">
 <div className="h-32 bg-gray-50 relative overflow-hidden">
 <Image src={product.image_url} alt="" width={300} height={128} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
 <div className="absolute top-2 right-2 flex gap-1">
 <button onClick={() => handleEditProduct(product)} className="bg-white/90 p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 backdrop-blur shadow"><Edit2 size={16} /></button>
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
 <p className="text-gray-500 mb-8">View all active users on the platform, their roles, and current coin counts.</p>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-200">
 <th className="py-4 px-4 font-bold text-gray-900">User</th>
 <th className="py-4 px-4 font-bold text-gray-900">Email</th>
 <th className="py-4 px-4 font-bold text-gray-900">Role</th>
 <th className="py-4 px-4 font-bold text-gray-900">Level</th>
 <th className="py-4 px-4 font-bold text-gray-900">Coins</th>
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
 <img src={usr.avatar_url} referrerPolicy="no-referrer" alt="" className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 object-cover" />
 ) : (
 <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
 {(usr.name || usr.email).charAt(0).toUpperCase()}
 </div>
 )}
 <div className="flex flex-col">
     <span className="font-extrabold text-gray-900 leading-tight">
         {usr.name || usr.email.split('@')[0]}
     </span>
     <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
         {usr.email}
     </span>
 </div>
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
 {activeTab === 'messages' && (
  <motion.div
  key="messages"
  initial={{ opacity: 0, x: 10 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -10 }}
  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
  >
  <div className="flex justify-between items-center mb-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">User Messages</h3>
        <p className="text-gray-500">View support requests and contact messages from users.</p>
      </div>
      <RefreshCcw size={20} className="text-gray-400 cursor-pointer hover:rotate-180 transition-all duration-500" onClick={fetchData} />
  </div>
  
  {messages.length === 0 ? (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No messages found. Ensure the contact_messages table is created in Supabase.</p>
      </div>
  ) : (
      <div className="space-y-6">
          {messages.map(msg => (
              <div key={msg.id} className="border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block ${msg.status === 'Replied' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>
                              {msg.status || 'New'}
                          </span>
                          <h4 className="font-bold text-gray-900 text-lg">{msg.subject}</h4>
                          <p className="text-sm text-gray-500">{msg.name} ({msg.email}) • {new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                      {msg.status !== 'Replied' && (
                        <button 
                            onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                            className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100"
                        >
                            {replyingTo === msg.id ? 'Cancel' : 'Reply'}
                        </button>
                      )}
                  </div>
                  
                  <div className="text-gray-700 bg-gray-50 p-5 rounded-2xl mb-4 text-sm leading-relaxed border border-gray-100">
                      {msg.message}
                  </div>

                  {msg.admin_reply && (
                      <div className="mt-4 border-l-4 border-brand-200 pl-4 py-2">
                          <p className="text-xs font-bold text-brand-600 uppercase mb-1">Your Previous Reply:</p>
                          <p className="text-sm text-gray-600 italic">"{msg.admin_reply}"</p>
                      </div>
                  )}

                  <AnimatePresence>
                      {replyingTo === msg.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 space-y-3 overflow-hidden"
                          >
                              <textarea 
                                placeholder="Type your response here..."
                                className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none min-h-[120px]"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                              <button 
                                onClick={() => handleSendReply(msg.id, msg.email)}
                                disabled={isSendingReply || !replyText.trim()}
                                className="w-full py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                              >
                                {isSendingReply ? 'Sending Email...' : 'Send Reply via Email'}
                              </button>
                          </motion.div>
                      )}
                  </AnimatePresence>
               </div>
           ))}
       </div>
   )}
   </motion.div>
   )}

  {activeTab === 'payouts' && (
      <motion.div
        key="payouts"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
      >
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payout Requests</h3>
                <p className="text-gray-500">Manage manual UPI withdrawal requests from users.</p>
            </div>
            <RefreshCcw size={20} className="text-gray-400 cursor-pointer hover:rotate-180 transition-all duration-500" onClick={fetchData} />
        </div>

        {payouts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <span className="text-4xl text-gray-300">💸</span>
                <p className="text-gray-500 font-medium mt-4">No payout requests found.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {payouts.map(payout => (
                    <div key={payout.id} className="border border-gray-200 rounded-2xl p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:border-green-100 transition-colors bg-white">
                        <div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-2 inline-block ${payout.status === 'PAID' ? 'bg-green-100 text-green-700' : payout.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {payout.status}
                            </span>
                            <h4 className="font-black text-gray-900 text-2xl mb-1">₹{payout.amount}</h4>
                            <p className="text-sm text-gray-500">UPI: <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded cursor-copy" title="Copy UPI" onClick={() => navigator.clipboard.writeText(payout.upi_id)}>{payout.upi_id}</span></p>
                            <p className="text-xs text-gray-400 mt-2">Requested by: {payout.users?.email} • {new Date(payout.created_at).toLocaleString()}</p>
                            {payout.status === 'PAID' && <p className="text-xs text-green-600 mt-1 font-bold">UTR: {payout.utr_number}</p>}
                        </div>

                        {payout.status === 'PENDING' && (
                            <div className="flex flex-col gap-3 w-full lg:w-96 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center mb-1">Make payment via UPI app then verify</p>
                                <input
                                    type="text"
                                    placeholder="Enter UTR / Txn ID"
                                    className="border border-gray-200 bg-white rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium text-sm"
                                    value={utrInput[payout.id] || ''}
                                    onChange={(e) => setUtrInput(prev => ({ ...prev, [payout.id]: e.target.value }))}
                                />
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => handleApprovePayout(payout.id)}
                                        disabled={!utrInput[payout.id]}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2 px-4 rounded-xl transition-all text-sm"
                                    >
                                        Mark as Paid
                                    </button>
                                    <button
                                        onClick={() => handleRejectPayout(payout.id)}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition-all text-sm border border-red-100"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </motion.div>
   )}

 {activeTab === 'daily_deals' && (
 <motion.div
 key="daily_deals"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 >
 <AdminDailyDeals session={session} />
 </motion.div>
 )}

 {activeTab === 'sync_reports' && (
 <motion.div
 key="sync_reports"
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -10 }}
 className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
 >
 <div className="flex justify-between items-center mb-8">
 <div>
 <h3 className="text-2xl font-bold text-gray-900">Price Sync Report</h3>
 <p className="text-sm text-gray-500">Products updated in the last 24 hours.</p>
 </div>
 <button 
 onClick={() => { setSyncResults([]); localStorage.removeItem('price_sync_results'); }}
 className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2"
 >
 <Trash2 size={18} /> Clear Report
 </button>
 </div>

 {syncResults.length === 0 ? (
 <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
 <RefreshCcw size={48} className="mx-auto text-gray-300 mb-4" />
 <p className="text-gray-500 font-medium">No recent price updates found.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {syncResults.map((res: any) => (
 <div key={res.id} className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-blue-100 transition-all">
 <div className="w-16 h-16 rounded-xl bg-gray-50 relative overflow-hidden shrink-0">
 <img src={res.image_url} alt="" className="w-full h-full object-cover" />
 </div>
 <div className="min-w-0 flex-grow">
 <h4 className="font-bold text-gray-900 text-sm truncate">{res.title}</h4>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-xs text-gray-400 line-through">₹{res.old?.toLocaleString()}</span>
 <span className="text-sm font-black text-green-600">₹{res.new?.toLocaleString()}</span>
 <span className="text-[10px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded">SAVE ₹{(res.old - res.new).toLocaleString()}</span>
 </div>
 </div>
 <a href={`/products/${res.id}`} target="_blank" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
 <ExternalLink size={18} />
 </a>
 </div>
 ))}
 </div>
 )}
 </motion.div>
 )}
   {activeTab === 'bus_routes' && (
       <motion.div
         key="bus_routes"
         initial={{ opacity: 0, x: 10 }}
         animate={{ opacity: 1, x: 0 }}
         exit={{ opacity: 0, x: -10 }}
         className="space-y-8"
       >
         {/* Add Bus Route Form */}
         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                 <div className="flex items-center gap-3">
                     <div className="bg-orange-100 p-3 rounded-2xl">
                         <Bus className="text-orange-600" size={24} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-black text-gray-900">Add New Bus Route</h3>
                         <p className="text-gray-500 text-sm">Add affiliate bus listings from RedBus, AbhiBus, etc.</p>
                     </div>
                 </div>
                 <button
                    onClick={() => {
                        setIsBusBulkImporting(!isBusBulkImporting);
                    }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg shadow-orange-200"
                 >
                    <PackagePlus size={18} /> {isBusBulkImporting ? 'Cancel' : 'Bulk Import Buses'}
                 </button>
             </div>

             <AnimatePresence>
                {isBusBulkImporting && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                            <h4 className="text-lg font-black text-orange-900 mb-2">Bus Routes Bulk Import</h4>
                            <p className="text-sm text-orange-700 mb-4 font-medium italic">
                                Paste your Excel-converted JSON here. Category will be set to 'bus-booking' automatically.
                            </p>
                            <textarea 
                                className="w-full p-4 rounded-xl border border-orange-200 bg-white font-mono text-xs mb-4" 
                                rows={10} 
                                placeholder='[ { "title": "SRS Travels", "price": 850, "search_keyword": "RedBus|08h|Bangalore|Chennai|..." } ]'
                                value={bulkJson}
                                onChange={e => setBulkJson(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleBulkImport('bus-booking')}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-xl shadow-lg shadow-orange-200"
                                >
                                    IMPORT ALL BUSES
                                </button>
                                <button 
                                    onClick={() => {
                                        const template = [
                                            {
                                                title: "Example Travels",
                                                description: "AC Sleeper (2+1)",
                                                price: 750,
                                                old_price: 850,
                                                affiliate_links: "https://your-link.com",
                                                search_keyword: "Partner|Duration|Source|Dest|Time|Seats",
                                                image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957"
                                            }
                                        ];
                                        setBulkJson(JSON.stringify(template, null, 2));
                                    } }
                                    className="px-6 bg-white border border-orange-200 text-orange-600 font-bold rounded-xl"
                                >
                                    Load Bus Template
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>

             <form onSubmit={handleAddBusRoute} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Partner Platform</label>
                     <select 
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none"
                         value={busForm.partner}
                         onChange={e => setBusForm({...busForm, partner: e.target.value})}
                         required
                     >
                         <option value="">Select Partner</option>
                         <option value="RedBus">RedBus</option>
                         <option value="AbhiBus">AbhiBus</option>
                         <option value="ZingBus">ZingBus</option>
                         <option value="MakeMyTrip">MakeMyTrip</option>
                     </select>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bus Operator Name</label>
                     <input 
                         type="text" 
                         placeholder="e.g. SRS Travels"
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none"
                         value={busForm.title}
                         onChange={e => setBusForm({...busForm, title: e.target.value})}
                         required
                     />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bus Type</label>
                     <input 
                         type="text" 
                         placeholder="e.g. AC Sleeper (2+1)"
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none"
                         value={busForm.description}
                         onChange={e => setBusForm({...busForm, description: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Source City</label>
                     <input 
                         type="text" 
                         placeholder="e.g. Bangalore"
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none"
                         value={busForm.source}
                         onChange={e => setBusForm({...busForm, source: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Destination City</label>
                     <input 
                         type="text" 
                         placeholder="e.g. Chennai"
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none"
                         value={busForm.destination}
                         onChange={e => setBusForm({...busForm, destination: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price (₹)</label>
                     <input 
                         type="number" 
                         placeholder="e.g. 850"
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                         value={busForm.price}
                         onChange={e => setBusForm({...busForm, price: e.target.value})}
                         required
                     />
                 </div>
                 <div className="md:col-span-3">
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Affiliate Booking Link (URL)</label>
                     <input 
                         type="url" 
                         placeholder="https://www.redbus.in/bus-tickets/..."
                         className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/20 outline-none"
                         value={busForm.link}
                         onChange={e => setBusForm({...busForm, link: e.target.value})}
                         required
                     />
                 </div>
                 <div className="md:col-span-3">
                     <button 
                         type="submit" 
                         disabled={loading}
                         className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all disabled:opacity-50"
                     >
                         {loading ? 'Adding Route...' : 'Add Bus Route Listing'}
                     </button>
                 </div>
             </form>
         </div>

         {/* Existing Bus Routes */}
         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <h3 className="text-xl font-bold text-gray-900 mb-6">Active Bus Listings</h3>
             <div className="grid grid-cols-1 gap-4">
                 {products.filter(p => p.category === 'bus-booking').map(bus => (
                     <div key={bus.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-orange-100 transition-colors">
                         <div className="flex items-center gap-4">
                             <div className="bg-orange-50 p-3 rounded-xl">
                                 <Bus size={20} className="text-orange-600" />
                             </div>
                             <div>
                                 <h4 className="font-bold text-gray-900">{bus.title}</h4>
                                 <p className="text-xs text-gray-500">{bus.description} • ₹{bus.price}</p>
                             </div>
                         </div>
                         <button 
                             onClick={() => handleDeleteBusRoute(bus.id)}
                             className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                         >
                             <Trash2 size={18} />
                         </button>
                     </div>
                 ))}
                 {products.filter(p => p.category === 'bus-booking').length === 0 && (
                     <p className="text-center py-8 text-gray-400 italic">No bus routes found. Add your first one above!</p>
                 )}
             </div>
         </div>
       </motion.div>
   )}
  </AnimatePresence>
  )}

      {/* Sync Results Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-white">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">Price Sync Results</h2>
                  <p className="text-sm text-violet-600 font-bold uppercase tracking-widest mt-1">
                    {syncResults.length} Products Updated Successfully
                  </p>
                </div>
                <button 
                  onClick={() => setShowSyncModal(false)}
                  className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {syncResults.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCcw size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">No products were updated during this sync.</p>
                  </div>
                ) : (
                  syncResults.map((result) => (
                    <div key={result.id} className="group relative bg-gray-50/50 rounded-2xl p-4 border border-gray-100 hover:border-violet-200 transition-all hover:bg-white hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                          <img 
                            src={result.image_url || '/placeholder.png'} 
                            alt="" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate pr-8">{result.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-400 line-through font-medium">₹{result.old}</span>
                            <span className="text-gray-400">→</span>
                            <span className={`text-base font-black ${result.new < result.old ? 'text-green-600' : 'text-violet-600'}`}>
                              ₹{result.new}
                            </span>
                            {result.new < result.old && (
                              <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                Price Drop!
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteFromSync(result.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => setShowSyncModal(false)}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                >
                  Done, Review Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
