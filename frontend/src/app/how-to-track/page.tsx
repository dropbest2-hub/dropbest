'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, Info, Copy, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <Link href="/" className="inline-flex items-center gap-2 text-brand-600 font-bold mb-8 hover:gap-3 transition-all">
                <ChevronLeft size={20} /> Back to Shopping
            </Link>

            <header className="mb-16">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-50 text-brand-700 rounded-2xl text-xs font-black uppercase tracking-widest mb-6">
                    <Info size={16} /> Tutorial Guide
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                    How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-violet-600">Track Your Orders?</span>
                </h1>
                <p className="text-xl text-gray-500 font-medium max-w-2xl">
                    Follow this simple guide to find your Order ID and get your rewards. Tracking your purchase is essential to earn coins!
                </p>
            </header>

            <div className="space-y-32">
                {/* Step 1 */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">1</div>
                        <h2 className="text-3xl font-black text-gray-900">Click the Store Link</h2>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed">
                            Always click the store button (Amazon, Flipkart, etc.) on DropBest before you buy. This ensures our community gets the referral and you get rewarded with coins!
                        </p>
                    </motion.div>
                    <div className="bg-brand-50 rounded-[2.5rem] p-8 border border-brand-100 flex items-center justify-center">
                         <div className="flex flex-wrap gap-2 justify-center">
                             <div className="bg-[#FF9900] text-white px-6 py-3 rounded-xl font-bold">Amazon</div>
                             <div className="bg-[#2874F0] text-white px-6 py-3 rounded-xl font-bold">Flipkart</div>
                             <div className="bg-[#ff3f6c] text-white px-6 py-3 rounded-xl font-bold">Myntra</div>
                         </div>
                    </div>
                </section>

                {/* Step 2 - Amazon */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative group">
                        <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <Image 
                            src="/guide/amazon-guide.png" 
                            alt="Amazon Guide" 
                            width={500} 
                            height={600} 
                            className="relative rounded-[2.5rem] shadow-2xl border border-gray-100 group-hover:scale-[1.02] transition-transform"
                        />
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6 order-1 md:order-2"
                    >
                        <div className="w-12 h-12 bg-[#FF9900] text-white rounded-2xl flex items-center justify-center font-black text-xl">2</div>
                        <h2 className="text-3xl font-black text-gray-900">Amazon Orders</h2>
                        <ul className="space-y-4">
                            {[
                                "Complete your purchase normally.",
                                "Go to 'Your Orders' in the Amazon app.",
                                "Find the 'Order ID' (Format: 405-xxxx-xxxx).",
                                "Long press and Copy the full number."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-gray-500 font-medium">
                                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" /> {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </section>

                {/* Step 3 - Flipkart */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="w-12 h-12 bg-[#2874F0] text-white rounded-2xl flex items-center justify-center font-black text-xl">3</div>
                        <h2 className="text-3xl font-black text-gray-900">Flipkart Orders</h2>
                        <ul className="space-y-4">
                            {[
                                "Go to 'Account' > 'My Orders'.",
                                "Select your latest purchase.",
                                "Locate the 'Order ID' (Format: OD1234567890).",
                                "Copy it and paste it in our tracker."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-gray-500 font-medium">
                                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" /> {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <Image 
                            src="/guide/flipkart-guide.png" 
                            alt="Flipkart Guide" 
                            width={500} 
                            height={600} 
                            className="relative rounded-[2.5rem] shadow-2xl border border-gray-100 group-hover:scale-[1.02] transition-transform"
                        />
                    </div>
                </section>

                {/* Step 4 - Myntra */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative group">
                        <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <Image 
                            src="/guide/myntra-guide.png" 
                            alt="Myntra Guide" 
                            width={500} 
                            height={600} 
                            className="relative rounded-[2.5rem] shadow-2xl border border-gray-100 group-hover:scale-[1.02] transition-transform"
                        />
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6 order-1 md:order-2"
                    >
                        <div className="w-12 h-12 bg-[#ff3f6c] text-white rounded-2xl flex items-center justify-center font-black text-xl">4</div>
                        <h2 className="text-3xl font-black text-gray-900">Myntra Orders</h2>
                        <ul className="space-y-4">
                            {[
                                "Go to your Profile > 'Orders'.",
                                "Select the product you purchased.",
                                "Copy the 'Order ID' shown at the top.",
                                "Example: 1234567-8901234567890."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-gray-500 font-medium">
                                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" /> {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </section>

                {/* Step 5 - Shopify */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="w-12 h-12 bg-[#96bf48] text-white rounded-2xl flex items-center justify-center font-black text-xl">5</div>
                        <h2 className="text-3xl font-black text-gray-900">Shopify / Global Stores</h2>
                        <ul className="space-y-4">
                            {[
                                "After purchase, check your Confirmation Email.",
                                "Store will provide an 'Order Number'.",
                                "Example: #1001 or #ORD-5678.",
                                "Enter the full number with hash (#) if applicable."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-gray-500 font-medium">
                                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" /> {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-green-500 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                        <Image 
                            src="/guide/shopify-guide.png" 
                            alt="Shopify Guide" 
                            width={500} 
                            height={600} 
                            className="relative rounded-[2.5rem] shadow-2xl border border-gray-100 group-hover:scale-[1.02] transition-transform"
                        />
                    </div>
                </section>

                {/* Final Step */}
                <section className="bg-gray-900 rounded-[3rem] p-12 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"></div>
                    
                    <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Done Shopping?</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
                        Copy your Order ID and enter it in DropBest Tracker to claim your coins! 💎
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-white text-gray-900 px-10 py-5 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
                        GO TO TRACKER <ChevronLeft className="rotate-180" />
                    </Link>
                </section>
            </div>
        </div>
    );
}
