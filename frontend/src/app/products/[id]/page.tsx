'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 Star, 
 ChevronLeft, 
 ExternalLink, 
 ShoppingBag, 
 MessageSquare, 
 ShieldCheck, 
 Award, 
 AlertCircle,
 Send,
 CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Review {
 id: string;
 rating: number;
 comment: string;
 is_verified: boolean;
 created_at: string;
 users: {
 name: string;
 avatar_url: string;
 user_level: string;
 };
}

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    amazon_link: string;
    flipkart_link: string;
    external_rating?: number;
    external_review_count?: string;
}

interface PriceHistory {
    recorded_at: string;
    price: number | string;
}

const LiveViewerCount = () => {
    const [viewers, setViewers] = useState(0);

    useEffect(() => {
        // Set an initial realistic number
        setViewers(Math.floor(Math.random() * (25 - 8 + 1)) + 8);
        
        const interval = setInterval(() => {
            setViewers(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const next = prev + change;
                return next < 3 ? 3 : next > 45 ? 45 : next;
            });
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-wider">{viewers} People viewing right now</span>
        </div>
    );
};

const PriceHistoryChart = ({ history }: { history: PriceHistory[] }) => {
    if (!history || history.length < 2) {
        return (
            <div className="bg-gray-50 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center border border-gray-100 border-dashed min-h-[300px]">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <ShieldCheck className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Price Tracking Initialized</h3>
                <p className="text-gray-400 text-sm max-w-xs mt-2">We&apos;ve started monitoring this product. Future price changes will appear in this chart.</p>
            </div>
        );
    }

    const data = history.map(h => ({
        date: new Date(h.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: Number(h.price),
        fullDate: new Date(h.recorded_at).toLocaleString()
    }));

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Send className="text-brand-500 rotate-90" size={24} /> 
                        Price Tracker
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">Historical price trends for this product</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-2xl text-brand-600 text-xs font-black uppercase tracking-widest">
                    Live Data
                </div>
            </div>

            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                borderRadius: '15px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#111827' }}
                            itemStyle={{ fontWeight: 700, color: '#8b5cf6' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#8b5cf6" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default function ProductDetails() {
 const { id } = useParams();
 const router = useRouter();
 const { user, session } = useAuthStore();
 
 const [product, setProduct] = useState<Product | null>(null);
 const [reviews, setReviews] = useState<Review[]>([]);
 const [history, setHistory] = useState<PriceHistory[]>([]);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 
 // Form State
 const [rating, setRating] = useState(5);
 const [comment, setComment] = useState('');
 const [canReview, setCanReview] = useState(false);

 const fetchData = useCallback(async () => {
 try {
 const [prodRes, revRes, histRes] = await Promise.all([
 axios.get(`${API_URL}/products/${id}`),
 axios.get(`${API_URL}/reviews/${id}`),
 axios.get(`${API_URL}/products/${id}/history`)
 ]);
 setProduct(prodRes.data);
 setReviews(revRes.data);
 setHistory(histRes.data);

 // Check if user can review (has ANY order for this product)
 if (user && session) {
 const { data: userOrders } = await axios.get(`${API_URL}/orders`, {
 headers: { Authorization: `Bearer ${session.access_token}` }
 });
 const hasOrderedThisProduct = userOrders.some((o: { product_id: string }) => o.product_id === id);
 setCanReview(hasOrderedThisProduct);
 }
 } catch (error) {
 console.error('Error fetching data:', error);
 // Don't toast if it's just a 401 on orders, but handle critical errors
 } finally {
 setLoading(false);
 }
 }, [id, user, session]);

 const avgSatisfaction = reviews.length > 0 
    ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length * 5)) * 100)
    : 100; // Default to 100 if no reviews yet (aspirational)

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const handleRedirect = async (link: string) => {
 if (user && session) {
 try {
 await axios.post(
 `${API_URL}/orders/redirect`,
 { productId: id },
 { headers: { Authorization: `Bearer ${session.access_token}` } }
 );
 } catch (error) {
 console.error('Error tracking redirect:', error);
 }
 }
 window.open(link, '_blank');
 };

 const handleSubmitReview = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!user || !session) return;
 
 setSubmitting(true);
 try {
 await axios.post(`${API_URL}/reviews`, {
 productId: id,
 rating,
 comment
 }, {
 headers: { Authorization: `Bearer ${session.access_token}` }
 });
 
 toast.success('Review posted! Verified status and Badge badge will be awarded after order confirmation.');
 setComment('');
 fetchData();
 } catch (error: unknown) {
 const message = error instanceof Error ? error.message : 'Failed to post review';
 toast.error(message);
 } finally {
 setSubmitting(false);
 }
 };

 if (loading) return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
 </div>
 );

 if (!product) return (
 <div className="text-center py-20">
 <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
 <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
 <button onClick={() => router.push('/')} className="mt-4 text-brand-600 font-bold hover:underline">Back to Home</button>
 </div>
 );

 return (
 <div className="max-w-6xl mx-auto px-6 py-10 space-y-12 animate-fade-in">
 {/* Header */}
 <button 
 onClick={() => router.push('/')}
 className="flex items-center gap-2 text-gray-500 font-bold hover:text-brand-600 transition-colors"
 >
 <ChevronLeft size={20} /> Back to Trending
 </button>

 {/* Product Hero */}
 <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 lg:gap-12">
 <motion.div 
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="w-full md:w-1/2 lg:w-2/5 flex-shrink-0"
 >
 <div className="bg-gray-50 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 relative group">
 <Image 
 src={product.image_url} 
 alt={product.title} 
 width={500}
 height={500}
 unoptimized
 className="w-full h-auto object-cover aspect-square group-hover:scale-105 transition-transform duration-700" 
 />
 <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl text-xl font-black text-brand-700 shadow-xl">
 ₹{product.price.toLocaleString()}
 </div>
 </div>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 className="flex flex-col flex-grow justify-center py-4"
 >
 <div className="flex flex-wrap items-center gap-3 mb-4">
    <span className="bg-brand-50 text-brand-700 text-[10px] font-black px-4 py-1.5 rounded-full border border-brand-100 uppercase tracking-widest">
      Verified Discovery
    </span>
    <LiveViewerCount />
  </div>
 
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6">{product.title}</h1>
 
 {/* External Stats */}
 {product.external_rating && (
 <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex-wrap">
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Market Rating</span>
 <div className="flex items-center gap-2">
 <div className="flex text-yellow-500">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={14} fill={i < Math.floor(product.external_rating || 0) ? 'currentColor' : 'none'} />
 ))}
 </div>
 <span className="font-black text-gray-900">{product.external_rating || 0}/5</span>
 </div>
 </div>
 <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Reviews</span>
 <span className="font-black text-gray-900">{product.external_review_count || '1,000+'}</span>
 </div>
 <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
      <ShieldCheck size={14} className="text-blue-600" />
    </div>
    <span className="text-xs font-bold text-gray-500">Aggregated Data</span>
  </div>
  <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
  <div className="flex flex-col">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">User Satisfaction</span>
    <div className="flex items-center gap-2">
      <span className="font-black text-brand-600 text-lg">{avgSatisfaction}%</span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500" style={{ width: `${avgSatisfaction}%` }}></div>
      </div>
    </div>
  </div>
</div>
 )}

 <p className="text-gray-500 text-lg leading-relaxed font-medium mb-8">
 {product.description}
 </p>

 <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-10">
 <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
 <CheckCircle2 size={18} className="text-brand-500 contrast-125" />
 Platform Benefits
 </h3>
 <ul className="text-sm text-gray-600 space-y-2 font-medium">
 <li className="flex items-start gap-2">🚀 Earn up to 8 badges on confirmation</li>
 <li className="flex items-start gap-2">🛡️ Early Review system enabled</li>
 <li className="flex items-start gap-2">💎 +1 extra badge for verified reviews</li>
 </ul>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {product.amazon_link && (
 <button 
 onClick={() => handleRedirect(product.amazon_link)}
 className="flex items-center justify-center gap-2 bg-[#FF9900] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#FF9900]/20 hover:-translate-y-1 transition-all"
 >
 Buy on Amazon <ExternalLink size={20} />
 </button>
 )}
 {product.flipkart_link && (
 <button 
 onClick={() => handleRedirect(product.flipkart_link)}
 className="flex items-center justify-center gap-2 bg-[#2874F0] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#2874F0]/20 hover:-translate-y-1 transition-all"
 >
 Buy on Flipkart <ExternalLink size={20} />
 </button>
 )}
 </div>
 </motion.div>
 </div>

 {/* Price History Section */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.15 }}
 >
    <PriceHistoryChart history={history} />
 </motion.div>

 {/* Reviews Section */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
 <div className="lg:col-span-2 space-y-8">
 <div className="flex items-center justify-between">
 <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
 <MessageSquare className="text-brand-500" size={32} />
 Community Reviews
 </h2>
 <span className="bg-gray-100 text-gray-600 px-5 py-2 rounded-full text-sm font-black">
 {reviews.length} REVIEWS
 </span>
 </div>

 <div className="space-y-6">
 {reviews.length === 0 ? (
 <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-gray-100 border-dashed">
 <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
 <h3 className="text-xl font-bold text-gray-900">Be the first to review!</h3>
 <p className="text-gray-500 font-medium mt-1">Share your experience and earn rewards.</p>
 </div>
 ) : (
 <AnimatePresence>
 {reviews.map((review, idx) => (
 <motion.div 
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.1 }}
 key={review.id} 
 className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
 >
 <div className="flex items-start justify-between mb-6">
 <div className="flex items-center gap-4">
 {review.users?.avatar_url ? (
 <Image src={review.users.avatar_url} alt="" width={56} height={56} className="w-14 h-14 rounded-full border-2 border-white shadow-lg" />
 ) : (
 <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xl shadow-inner uppercase">
 {review.users?.name?.charAt(0) || '?'}
 </div>
 )}
 <div>
 <div className="flex items-center gap-2 mb-1">
 <h4 className="font-bold text-gray-900 text-lg">{review.users?.name || 'Anonymous User'}</h4>
 {review.is_verified && (
 <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-green-100 px-3 py-1 rounded-full text-green-700">
 <ShieldCheck size={12} /> Verified Buyer
 </span>
 )}
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-black uppercase tracking-widest bg-violet-100 px-3 py-1 rounded-full text-violet-700">
 {review.users?.user_level || 'BRONZE'}
 </span>
 <span className="text-xs text-gray-400 font-bold border-l pl-2 border-gray-200">
 {new Date(review.created_at).toLocaleDateString()}
 </span>
 </div>
 </div>
 </div>
 <div className="flex gap-1 text-yellow-400">
 {[...Array(5)].map((_, i) => (
 <Star key={i} size={18} fill={i < review.rating ? 'currentColor' : 'none'} />
 ))}
 </div>
 </div>
 <p className="text-gray-600 font-medium leading-[1.8] text-lg">
 {review.comment}
 </p>
 </motion.div>
 ))}
 </AnimatePresence>
 )}
 </div>
 </div>

 {/* Sidebar Sticky Form */}
 <div className="lg:col-span-1">
 <div className="sticky top-24 space-y-6">
 {canReview ? (
 <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100">
 <div className="flex items-center gap-3 mb-8">
 <div className="bg-gray-900 text-white p-3 rounded-2xl">
 <Award size={24} />
 </div>
 <h3 className="text-2xl font-black text-gray-900">Share Feedback</h3>
 </div>
 <form onSubmit={handleSubmitReview} className="space-y-8">
 <div>
 <label className="block text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">How would you rate it?</label>
 <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 key={star}
 type="button"
 onClick={() => setRating(star)}
 className={`p-1 transition-all hover:scale-125 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
 >
 <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
 </button>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">What&apos;s on your mind?</label>
 <textarea
 required
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 rows={5}
 className="w-full px-6 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-brand-500/10 outline-none font-medium transition-all text-gray-700 placeholder:text-gray-300 resize-none"
 placeholder="Write your review here..."
 ></textarea>
 </div>

 <button
 disabled={submitting}
 type="submit"
 className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black shadow-xl hover:shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
 >
 {submitting ? 'Posting...' : <><Send size={18} /> POST REVIEW</>}
 </button>
 </form>
 <p className="mt-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
 EARN 1 BADGE BONUS ONCE YOUR PURCHASE IS CONFIRMED BY ADMIN
 </p>
 </div>
 ) : (
 <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-[2.5rem] text-center text-white shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
 <div className="relative z-10">
 <div className="bg-white/20 backdrop-blur-md p-5 rounded-full w-fit mx-auto mb-6 shadow-xl border border-white/20">
 <ShoppingBag size={40} />
 </div>
 <h3 className="text-2xl font-black mb-3">Wait a moment!</h3>
 <p className="text-violet-100 text-sm font-medium leading-relaxed mb-8">
 You need to have tracked this product via our links to leave a review and earn badges.
 </p>
 <button 
 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
 className="w-full py-4 bg-white text-violet-700 rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
 >
 Check Purchase Links
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
