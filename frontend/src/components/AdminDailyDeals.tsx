'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Clock, Save, Trash2, Plus, Search, Tag, Percent } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { API_URL } from '@/lib/api';

interface Product {
    id: string;
    title: string;
    price: number | string;
    image_url: string;
    category?: string;
    is_daily_deal?: boolean;
    deal_discount_text?: string;
    deal_tag?: string;
    deal_expires_at?: string;
}

export default function AdminDailyDeals({ session }: { session: any }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [dailyDeals, setDailyDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [dealForm, setDealForm] = useState({
        discount_text: '',
        tag: 'FLASH DEAL',
        hours: ''
    });
    const [addMode, setAddMode] = useState<'existing' | 'custom'>('existing');
    const [customDeal, setCustomDeal] = useState({
        title: '', description: '', price: '', image_url: '', affiliate_link: '', discount_text: '', hours: '10'
    });

    const handleCreateCustomDeal = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let expiryDate = null;
        if (customDeal.hours) {
            const now = new Date();
            now.setHours(now.getHours() + parseInt(customDeal.hours));
            expiryDate = now.toISOString();
        }

        try {
            await axios.post(
                `${API_URL}/products`,
                {
                    title: customDeal.title,
                    description: customDeal.description,
                    price: parseFloat(customDeal.price),
                    image_url: customDeal.image_url,
                    amazon_link: customDeal.affiliate_link,
                    category: 'electronics',
                    is_daily_deal: true,
                    deal_discount_text: customDeal.discount_text ? `${customDeal.discount_text}% OFF` : 'SPECIAL OFFER',
                    deal_tag: 'FLASH DEAL',
                    deal_expires_at: expiryDate
                },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            alert('Custom Deal Created!');
            setCustomDeal({ title: '', description: '', price: '', image_url: '', affiliate_link: '', discount_text: '', hours: '10' });
            fetchProducts();
        } catch (err) {
            alert('Failed to create custom deal');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
            setDailyDeals(res.data.filter((p: Product) => p.is_daily_deal));
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDeal = async () => {
        if (!selectedProduct) return;
        
        // Calculate expiry date based on hours
        let expiryDate = null;
        if (dealForm.hours) {
            const now = new Date();
            now.setHours(now.getHours() + parseInt(dealForm.hours));
            expiryDate = now.toISOString();
        }

        try {
            await axios.put(
                `${API_URL}/products/${selectedProduct.id}`,
                {
                    ...selectedProduct,
                    is_daily_deal: true,
                    deal_discount_text: dealForm.discount_text,
                    deal_tag: dealForm.tag,
                    deal_expires_at: expiryDate
                },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            alert('Daily Deal Added!');
            setSelectedProduct(null);
            setDealForm({ discount_text: '', tag: 'FLASH DEAL', hours: '' });
            fetchProducts();
        } catch (err) {
            alert('Failed to add deal');
        }
    };

    const handleRemoveDeal = async (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        try {
            await axios.put(
                `${API_URL}/products/${productId}`,
                {
                    ...product,
                    is_daily_deal: false,
                    deal_discount_text: null,
                    deal_tag: null,
                    deal_expires_at: null
                },
                { headers: { Authorization: `Bearer ${session?.access_token}` } }
            );
            alert('Deal Removed!');
            fetchProducts();
        } catch (err) {
            alert('Failed to remove deal');
        }
    };

    const filteredProducts = products.filter(p => 
        !p.is_daily_deal && 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        p.category !== 'bus-booking'
    ).slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="text-orange-500" fill="currentColor" /> Daily Deals Management
                </h3>
                <p className="text-gray-500 font-medium mb-8">Select products to show in the "Today's Flash Deals" section on the home page.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Add New Deal Form */}
                    <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-900">Add New Daily Deal</h4>
                            <div className="flex gap-2">
                                <button onClick={() => setAddMode('existing')} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${addMode === 'existing' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-200'}`}>From Existing</button>
                                <button onClick={() => setAddMode('custom')} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${addMode === 'custom' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-200'}`}>Create Custom</button>
                            </div>
                        </div>

                        {addMode === 'existing' ? (
                            <>
                        <div className="relative">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Search Product</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Type product name..." 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            {searchQuery && filteredProducts.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                                    {filteredProducts.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedProduct(p);
                                                setSearchQuery('');
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-violet-50 flex items-center gap-3 transition-colors border-b last:border-0"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden">
                                                <Image src={p.image_url} alt="" fill className="object-cover" unoptimized />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{p.title}</p>
                                                <p className="text-xs text-gray-500">₹{Number(p.price).toLocaleString()}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedProduct && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 relative overflow-hidden">
                                        <Image src={selectedProduct.image_url} alt="" fill className="object-cover" unoptimized />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900">{selectedProduct.title}</p>
                                        <p className="text-sm font-bold text-brand-600">₹{Number(selectedProduct.price).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Discount Text (e.g. 50% OFF)</label>
                                        <input 
                                            type="text" 
                                            placeholder="50% OFF" 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                            value={dealForm.discount_text}
                                            onChange={e => setDealForm({ ...dealForm, discount_text: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deal Tag (e.g. FLASH DEAL)</label>
                                        <input 
                                            type="text" 
                                            placeholder="FLASH DEAL" 
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                            value={dealForm.tag}
                                            onChange={e => setDealForm({ ...dealForm, tag: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">How many hours? (Countdown)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 24"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                        value={dealForm.hours}
                                        onChange={e => setDealForm({ ...dealForm, hours: e.target.value })}
                                    />
                                </div>

                                <button 
                                    onClick={handleAddDeal}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} /> ACTIVATE DEAL
                                </button>
                            </motion.div>
                        )}
                        </>
                        ) : (
                            <form onSubmit={handleCreateCustomDeal} className="space-y-4">
                                <input required placeholder="Product Title" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={customDeal.title} onChange={e => setCustomDeal({...customDeal, title: e.target.value})} />
                                <input required placeholder="Image URL" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={customDeal.image_url} onChange={e => setCustomDeal({...customDeal, image_url: e.target.value})} />
                                <input required placeholder="Affiliate Link" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={customDeal.affiliate_link} onChange={e => setCustomDeal({...customDeal, affiliate_link: e.target.value})} />
                                <input required type="number" placeholder="Price / Rate (₹)" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={customDeal.price} onChange={e => setCustomDeal({...customDeal, price: e.target.value})} />
                                <textarea required placeholder="Description..." rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={customDeal.description} onChange={e => setCustomDeal({...customDeal, description: e.target.value})} />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">% Offer (Optional)</label>
                                        <input type="number" placeholder="e.g. 50" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={customDeal.discount_text} onChange={e => setCustomDeal({...customDeal, discount_text: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Hours Active</label>
                                        <input type="number" placeholder="10" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" value={customDeal.hours} onChange={e => setCustomDeal({...customDeal, hours: e.target.value})} />
                                    </div>
                                </div>
                                
                                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> CREATE CUSTOM DEAL
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Active Deals List */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            Active Deals <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{dailyDeals.length}</span>
                        </h4>
                        
                        <div className="space-y-3">
                            {dailyDeals.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <Zap size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-gray-500 text-sm">No active deals. Add one above.</p>
                                </div>
                            ) : (
                                dailyDeals.map(deal => (
                                    <div key={deal.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 relative overflow-hidden">
                                                <Image src={deal.image_url} alt="" fill className="object-cover" unoptimized />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm line-clamp-1">{deal.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded">{deal.deal_discount_text}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{deal.deal_tag}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveDeal(deal.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
