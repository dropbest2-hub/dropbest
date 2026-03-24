'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ExternalLink, ChevronRight, AlertCircle, RefreshCcw, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    amazon_link: string;
    flipkart_link: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const [watchlist, setWatchlist] = useState<string[]>([]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError('Connection refused. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWatchlist = useCallback(async () => {
        if (user) {
            try {
                const response = await api.get('/users/watchlist');
                setWatchlist(response.data.map((w: any) => w.product_id));
            } catch (err) {
                console.error('Error fetching watchlist:', err);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchProducts();
        fetchWatchlist();
    }, [fetchProducts, fetchWatchlist]);

    const handleRedirect = async (productId: string, link: string) => {
        if (user) {
            try {
                await api.post('/orders/redirect', { productId });
            } catch (error) {
                console.error('Error tracking redirect:', error);
            }
        }
        window.open(link, '_blank');
    };

    const handleWatch = async (productId: string) => {
        if (!user) return;
        const isWatched = watchlist.includes(productId);
        try {
            if (isWatched) {
                await api.delete(`/users/watchlist/${productId}`);
                setWatchlist(prev => prev.filter(id => id !== productId));
            } else {
                await api.post('/users/watchlist', { product_id: productId });
                setWatchlist(prev => [...prev, productId]);
            }
        } catch (err) {
            console.error('Error toggling watch:', err);
        }
    };

 return (
 <div className="space-y-12 animate-fade-in pb-20">
 {/* Hero Section */}
 <section className="text-center py-20 px-6 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
 <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
 <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>

 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.8 }}
 className="relative z-10 max-w-4xl mx-auto"
 >
 <div className="inline-block px-4 py-1.5 bg-violet-500/20 backdrop-blur-md rounded-full border border-violet-400/30 text-violet-300 text-sm font-bold mb-6">
 ✨ Community-Driven Affiliate Platform
 </div>
 {user && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-2xl sm:text-3xl font-bold text-white mb-4"
 >
 Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
 {user.name || user.email.split('@')[0]}
 </span> 👋
 </motion.div>
 )}
 <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
 Curated Picks. <br />
 <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-fuchsia-300 bg-clip-text text-transparent">Exclusive Rewards.</span>
 </h1>
 <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
 Shop smarter with our verified discovery engine. Earn badges for your style and convert them into shopping coupons.
 </p>

 <div className="flex flex-wrap items-center justify-center gap-4">
 {!user ? (
 <motion.a
 whileHover={{ scale: 1.05, y: -2 }}
 whileTap={{ scale: 0.95 }}
 href="/auth"
 className="inline-flex items-center gap-2 bg-white text-violet-700 font-black px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
 >
 Get Started <ChevronRight size={20} />
 </motion.a>
 ) : (
 <motion.a
 whileHover={{ scale: 1.05, y: -2 }}
 whileTap={{ scale: 0.95 }}
 href={user?.role === 'ADMIN' ? '/admin' : '/profile'}
 className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
 >
 Go to Dashboard <ChevronRight size={20} />
 </motion.a>
 )}
 <a href="#trending" className="text-violet-300 font-bold hover:text-white px-6 py-4 transition-colors">
 Explore Products
 </a>
 </div>
 </motion.div>
 </section>

 {/* Product Grid */}
 <section id="trending" className="scroll-mt-24">
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
 <div>
 <h2 className="text-4xl font-black text-gray-900 tracking-tight">Trending Now</h2>
 <p className="text-gray-500 font-medium">Top picks from the community this week.</p>
 </div>

 {error && (
 <button
 onClick={fetchProducts}
 className="flex items-center gap-2 text-brand-600 font-bold hover:bg-brand-50 px-4 py-2 rounded-xl transition-all border border-brand-100"
 >
 <RefreshCcw size={18} /> Retry Connection
 </button>
 )}
 </div>

 {loading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
 {[1, 2, 3, 4].map((n) => (
 <div key={n} className="bg-white rounded-3xl h-[28rem] animate-pulse shadow-sm border border-gray-100"></div>
 ))}
 </div>
 ) : error ? (
 <div className="text-center py-20 bg-red-50/50 rounded-[2.5rem] border border-red-100">
 <div className="bg-red-100 text-red-600 p-4 rounded-full w-fit mx-auto mb-6">
 <AlertCircle size={40} />
 </div>
 <h3 className="text-2xl font-black text-gray-900">{error}</h3>
 <p className="text-gray-500 mt-2 max-w-sm mx-auto">
 We couldn't reach the API server. Please check the backend console or configuration.
 </p>
 <button
 onClick={fetchProducts}
 className="mt-8 bg-red-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
 >
 Try Again
 </button>
 </div>
 ) : products.length === 0 ? (
 <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
 <div className="bg-gray-50 p-6 rounded-full w-fit mx-auto mb-6">
 <ShoppingCart size={48} className="text-gray-300" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900">Catalogue is Empty</h3>
 <p className="text-gray-500 mt-2">New products are arriving soon. Stay tuned!</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
 {products.map((product, index) => (
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: index * 0.1 }}
 key={product.id}
 className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-500 flex flex-col h-full relative"
 >
 <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={product.image_url}
 alt={product.title}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
 />
 <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-base font-black text-brand-700 shadow-lg group-hover:bg-brand-600 group-hover:text-white transition-all">
 ₹{product.price.toLocaleString()}
 </div>
 {user && (
 <button
 onClick={() => handleWatch(product.id)}
 className={`absolute top-4 left-4 p-3 rounded-2xl backdrop-blur-md transition-all shadow-lg ${watchlist.includes(product.id) ? 'bg-fuchsia-600 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'}`}
 >
 {watchlist.includes(product.id) ? <EyeOff size={20} /> : <Eye size={20} />}
 </button>
 )}
 </div>

 <div className="p-6 flex flex-col flex-grow">
 <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-1">{product.title}</h3>
 <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium flex-grow">
 {product.description}
 </p>

 <div className="flex flex-col gap-3 mt-auto">
 <div className="flex gap-2">
 {product.amazon_link && (
 <button
 onClick={() => handleRedirect(product.id, product.amazon_link)}
 className="flex-1 flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#FF9900]/10"
 >
 Amazon <ExternalLink size={16} />
 </button>
 )}
 {product.flipkart_link && (
 <button
 onClick={() => handleRedirect(product.id, product.flipkart_link)}
 className="flex-1 flex items-center justify-center gap-2 bg-[#2874F0] hover:bg-[#2874F0]/90 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#2874F0]/10"
 >
 Flipkart <ExternalLink size={16} />
 </button>
 )}
 </div>

 <a href={`/products/${product.id}`} className="mt-2 flex items-center justify-center gap-1 py-1 text-center text-sm text-gray-400 font-bold hover:text-brand-600 transition-colors uppercase tracking-widest">
 View Reviews <ChevronRight size={14} />
 </a>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 )}
 </section>
 </div>
 );
}
