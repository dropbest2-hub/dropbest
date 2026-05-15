'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Star, ExternalLink, ChevronRight, AlertCircle, RefreshCcw, Eye, EyeOff, Flame, Search, Package, HelpCircle } from 'lucide-react';
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
    shopsy_link?: string;
    ajio_link?: string;
    watch_count?: number;
    category?: string;
    search_keywords?: string;
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

export default function DiscoverPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [showTrackerPrompt, setShowTrackerPrompt] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState('all');
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
        // Open the external link immediately for speed
        window.open(link, '_blank');

        if (!user) {
            router.push('/auth');
            return;
        }
        api.post('/orders/redirect', { productId }).then(() => setShowTrackerPrompt(true));
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

    const filteredProducts = products.filter(p => {
        if (p.category === 'bus-booking') return false;
        if (selectedBrand === 'amazon' && !p.amazon_link) return false;
        if (selectedBrand === 'flipkart' && !p.flipkart_link) return false;
        if (selectedBrand === 'myntra' && !p.myntra_link) return false;
        if (selectedBrand === 'shopsy' && !p.shopsy_link) return false;
        if (selectedBrand === 'ajio' && !p.ajio_link) return false;
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (p.search_keywords && p.search_keywords.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="pt-24 pb-20 space-y-12 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6">
            <section id="trending">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Discover</h1>
                        <p className="text-gray-500 font-medium">Explore the best products curated by the community.</p>
                    </div>
                    <ProductStats count={filteredProducts.length} />
                </div>
                
                {/* Brand Filters */}
                <div className="mb-12">
                    <div className="flex flex-wrap gap-4">
                        {[
                            { id: 'amazon', name: 'Amazon', color: '#FF9900', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg' },
                            { id: 'flipkart', name: 'Flipkart', color: '#2874F0', logo: '/flipkart.png' },
                            { id: 'myntra', name: 'Myntra', color: '#ff3f6c', logo: '/myntra.jpg' },
                            { id: 'shopsy', name: 'Shopsy', color: '#ffd500', logo: '/shopsy.webp' },
                            { id: 'ajio', name: 'Ajio', color: '#2c4152', logo: '/Ajio.webp' }
                        ].map((brand) => (
                            <motion.button
                                key={brand.id}
                                whileHover={{ y: -4 }}
                                onClick={() => setSelectedBrand(selectedBrand === brand.id ? 'all' : brand.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all border-2
                                    ${selectedBrand === brand.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-transparent shadow-sm hover:shadow-md'}`}
                            >
                                <img src={brand.logo} alt={brand.name} className="w-5 h-5 object-contain" />
                                <span className="font-bold text-sm uppercase tracking-widest">{brand.name}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                <CategoryList activeCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

                {/* Search */}
                <div className="relative max-w-2xl mx-auto my-12">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
                        {[1, 2, 3, 4].map(n => <div key={n} className="bg-white rounded-3xl h-96 shadow-sm border border-gray-100"></div>)}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100">
                        <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No products found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <motion.div key={product.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all flex flex-col h-full">
                                <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
                                    <Image src={product.image_url} alt={product.title} width={400} height={224} unoptimized className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-2xl text-base font-black text-brand-700 shadow-lg">₹{product.price.toLocaleString()}</div>
                                    {(product.watch_count || 0) >= 2 && <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">HOT DEAL</div>}
                                    {user && (
                                        <button onClick={() => handleWatch(product.id)} className={`absolute top-4 left-4 p-3 rounded-2xl backdrop-blur-md transition-all shadow-lg ${watchlist.includes(product.id) ? 'bg-fuchsia-600 text-white' : 'bg-white/80 text-gray-600'}`}>
                                            {watchlist.includes(product.id) ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-1">{product.title}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed font-medium flex-grow">{product.description}</p>
                                    <div className="flex flex-col gap-4 mt-auto">
                                        <div className="flex flex-wrap gap-3">
                                            {product.amazon_link && <button onClick={() => handleRedirect(product.id, product.amazon_link)} className="flex-1 bg-[#FF9900] hover:bg-[#FF9900]/90 text-white py-4 rounded-2xl font-black text-sm min-w-[100px] shadow-lg shadow-[#FF9900]/10 transition-all active:scale-95">Amazon</button>}
                                            {product.flipkart_link && <button onClick={() => handleRedirect(product.id, product.flipkart_link)} className="flex-1 bg-[#2874F0] hover:bg-[#2874F0]/90 text-white py-4 rounded-2xl font-black text-sm min-w-[100px] shadow-lg shadow-[#2874F0]/10 transition-all active:scale-95">Flipkart</button>}
                                            {product.myntra_link && <button onClick={() => handleRedirect(product.id, product.myntra_link!)} className="flex-1 bg-[#ff3f6c] hover:bg-[#ff3f6c]/90 text-white py-4 rounded-2xl font-black text-sm min-w-[100px] shadow-lg shadow-[#ff3f6c]/10 transition-all active:scale-95">Myntra</button>}
                                            {product.shopsy_link && <button onClick={() => handleRedirect(product.id, product.shopsy_link!)} className="flex-1 bg-[#ffd500] hover:bg-[#ffd500]/90 text-gray-900 py-4 rounded-2xl font-black text-sm min-w-[100px] shadow-lg shadow-[#ffd500]/10 transition-all active:scale-95">Shopsy</button>}
                                            {product.ajio_link && <button onClick={() => handleRedirect(product.id, product.ajio_link!)} className="flex-1 bg-[#2c4152] hover:bg-[#2c4152]/90 text-white py-4 rounded-2xl font-black text-sm min-w-[100px] shadow-lg shadow-[#2c4152]/10 transition-all active:scale-95">Ajio</button>}
                                        </div>
                                        <Link href={`/products/${product.id}`} className="mt-2 flex items-center justify-center gap-1 py-1 text-center text-[11px] text-gray-400 font-black hover:text-brand-600 transition-colors uppercase tracking-[0.2em]">
                                            Discover Product <ChevronRight size={14} />
                                        </Link>
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
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-8 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
                        <div className="bg-gray-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl flex items-center gap-6 pointer-events-auto max-w-2xl">
                            <div className="flex items-center gap-4">
                                <Package size={32} className="text-brand-400" />
                                <div>
                                    <h4 className="text-white font-black">Mark Order Tracker?</h4>
                                    <p className="text-gray-400 text-xs">Track your coins for this order!</p>
                                </div>
                            </div>
                            <button onClick={() => router.push('/profile')} className="bg-brand-500 text-white font-black text-xs px-6 py-2.5 rounded-xl">YES, TRACK IT!</button>
                            <button onClick={() => setShowTrackerPrompt(false)} className="text-gray-500">✕</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
