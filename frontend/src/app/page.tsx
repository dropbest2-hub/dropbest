'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Star, ExternalLink, ChevronRight, AlertCircle, RefreshCcw, Eye, EyeOff, Award, Zap, Gift, Smartphone, Flame, Search, Package } from 'lucide-react';
import CategoryList from '@/components/CategoryList';
import { useAuthStore } from '@/store/authStore';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    amazon_link: string;
    flipkart_link: string;
    myntra_link?: string;
    watch_count?: number;
    category?: string;
}

const ProductStats = ({ count }: { count: number }) => {
    if (count === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-4 mb-10">
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-4 px-8 py-4 bg-white/80 backdrop-blur-md rounded-[2rem] border border-gray-100 shadow-sm"
            >
                <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-4 border-white bg-brand-100 flex items-center justify-center text-xs font-black text-brand-700 shadow-sm">
                        <ShoppingCart size={18} />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
                        {count.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Total Products</span>
                </div>
            </motion.div>
        </div>
    );
};

export default function Home() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [showTrackerPrompt, setShowTrackerPrompt] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Connection refused. Please ensure the backend server is running.';
            console.error('Error fetching products:', err);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWatchlist = useCallback(async () => {
        if (user) {
            try {
                const response = await api.get('/users/watchlist');
                setWatchlist(response.data.map((w: { product_id: string }) => w.product_id));
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
                setShowTrackerPrompt(true);
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

                {/* 3D Floating Assets */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-10 text-white/10"
                    >
                        <Award size={180} />
                    </motion.div>
                    <motion.div 
                        animate={{ y: [0, 50, 0], rotate: [0, -20, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-20 right-20 text-white/5"
                    >
                        <Zap size={240} />
                    </motion.div>
                    <motion.div 
                        animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/4 text-white/10"
                    >
                        <Gift size={100} />
                    </motion.div>
                    <motion.div 
                        animate={{ y: [0, 40, 0], rotate: [0, 45, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 right-1/4 text-white/5"
                    >
                        <Smartphone size={160} />
                    </motion.div>
                </div>

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
                        Shop smarter with our verified discovery engine. Earn coins for your style and convert them into shopping coupons.
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
            <section id="trending" className="scroll-mt-24 pt-10">
                <ProductStats count={products.length} />
                
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Shop by Category</h3>
                <CategoryList 
                    activeCategory={selectedCategory} 
                    onCategoryChange={(cat) => {
                        setSelectedCategory(cat);
                    }} 
                />

                {/* Official Brand Filters */}
                <div className="mb-12">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Shop official Stores</h3>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                        {[
                            { id: 'amazon', name: 'Amazon', color: '#FF9900', lightColor: 'bg-[#FF9900]/10', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg' },
                            { id: 'flipkart', name: 'Flipkart', color: '#2874F0', lightColor: 'bg-[#2874F0]/10', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flipkart-brand.png/1200px-Flipkart-brand.png' },
                            { id: 'myntra', name: 'Myntra', color: '#ff3f6c', lightColor: 'bg-[#ff3f6c]/10', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Myntra_Logo.png/1200px-Myntra_Logo.png' }
                        ].map((brand) => (
                            <motion.button
                                key={brand.id}
                                whileHover={{ 
                                    y: -8, 
                                    scale: 1.05,
                                    rotateY: 10,
                                    transition: { type: "spring", stiffness: 400, damping: 10 }
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedCategory(selectedCategory === brand.id ? 'all' : brand.id)}
                                className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 border-2 overflow-hidden
                                    ${selectedCategory === brand.id 
                                        ? `border-[${brand.color}] shadow-xl scale-105` 
                                        : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}
                                style={{ 
                                    borderColor: selectedCategory === brand.id ? brand.color : 'transparent',
                                    perspective: '1000px'
                                }}
                            >
                                {selectedCategory === brand.id && (
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: brand.color }} />
                                )}
                                <div className="w-8 h-8 relative shrink-0">
                                    <Image 
                                        src={brand.logo} 
                                        alt={brand.name} 
                                        fill 
                                        className={`object-contain transition-transform duration-500 group-hover:scale-110 ${selectedCategory === brand.id ? 'brightness-110' : 'grayscale group-hover:grayscale-0'}`} 
                                    />
                                </div>
                                <span className={`font-black uppercase tracking-widest text-xs transition-colors
                                    ${selectedCategory === brand.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}
                                    style={{ color: selectedCategory === brand.id ? brand.color : '' }}
                                >
                                    {brand.name}
                                </span>

                                {selectedCategory === brand.id && (
                                    <motion.div 
                                        layoutId="brand-indicator"
                                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                        style={{ backgroundColor: brand.color }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mb-12">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for your favorite products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-gray-700 font-medium placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-6 flex items-center text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold"
                        >
                            CLEAR
                        </button>
                    )}
                </div>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" style={{ perspective: '1000px' }}>
                        {products
                            .filter(p => {
                                // Store-based filtering logic
                                if (selectedCategory === 'amazon') return !!p.amazon_link;
                                if (selectedCategory === 'flipkart') return !!p.flipkart_link;
                                if (selectedCategory === 'myntra') return !!p.myntra_link;

                                const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
                                const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                     p.description.toLowerCase().includes(searchQuery.toLowerCase());
                                return matchesCategory && matchesSearch;
                            })
                            .map((product, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ 
                                    y: -16,
                                    scale: 1.03,
                                    transition: { type: "spring", stiffness: 400, damping: 10 }
                                }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                key={product.id}
                                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-500 flex flex-col h-full relative"
                            >
                                <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
                                    <Image
                                        src={product.image_url}
                                        alt={product.title}
                                        width={400}
                                        height={224}
                                        unoptimized
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-base font-black text-brand-700 shadow-lg group-hover:bg-brand-600 group-hover:text-white transition-all">
                                        ₹{product.price.toLocaleString()}
                                    </div>
                                    {(product.watch_count || 0) >= 2 && (
                                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                                            <Flame size={12} fill="currentColor" /> HOT DEAL
                                        </div>
                                    )}
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
                                            {product.myntra_link && (
                                                <button
                                                    onClick={() => handleRedirect(product.id, product.myntra_link!)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-[#ff3f6c] hover:bg-[#ff3f6c]/90 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-[#ff3f6c]/10"
                                                >
                                                    Myntra <ExternalLink size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <a href={`/products/${product.id}`} className="mt-2 flex items-center justify-center gap-1 py-1 text-center text-sm text-gray-400 font-bold hover:text-brand-600 transition-colors uppercase tracking-widest">
                                            Discover Product <ChevronRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        {/* Tracker Prompt */}
            <AnimatePresence>
                {showTrackerPrompt && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        className="fixed bottom-8 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none"
                    >
                        <div className="bg-gray-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6 pointer-events-auto max-w-2xl bg-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="bg-brand-500/20 text-brand-400 p-3 rounded-2xl">
                                    <Package size={32} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-black text-lg leading-none mb-1">Mark Order Tracker? 🛒</h4>
                                    <p className="text-gray-400 text-xs font-medium">Just placed an order? Track your coins now!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={() => router.push('/profile')}
                                    className="flex-1 sm:flex-none bg-brand-500 hover:bg-brand-600 text-white font-black text-xs px-8 py-3 rounded-2xl shadow-lg shadow-brand-500/20 transition-all active:scale-95"
                                >
                                    YES, TRACK IT!
                                </button>
                                <button 
                                    onClick={() => setShowTrackerPrompt(false)}
                                    className="p-3 text-gray-500 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

