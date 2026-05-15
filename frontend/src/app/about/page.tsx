'use client';
import { motion } from 'framer-motion';
import { ShoppingBag, Award, ShieldCheck, Users, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-5xl mx-auto py-16 px-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-20"
            >
                <div className="inline-flex p-4 bg-brand-100 text-brand-600 rounded-3xl mb-6">
                    <Heart size={48} className="animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">Our Mission</h1>
                <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed">
                    We're building the world's most transparent community-driven shopping discovery platform.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28">
                <div className="space-y-8">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">What is DropBest!?</h2>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed">
                        DropBest! is not just another affiliate site. We are a community of smart shoppers who believe in mutual benefits. Our platform curates the best deals from top retailers like Amazon, Flipkart, and Myntra, while rewarding our users for their engagement.
                    </p>
                    <div className="space-y-4">
                        {[
                            { icon: <ShoppingBag className="text-orange-500" />, title: "Curated Discovery", desc: "No more endless scrolling. We find what's actually worth buying." },
                            { icon: <Award className="text-yellow-500" />, title: "Reward System", desc: "Earn coins for every purchase and convert them into real value." },
                            { icon: <ShieldCheck className="text-green-500" />, title: "Verified Links", desc: "Every link is checked for safety and authenticity." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                <div className="shrink-0">{item.icon}</div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden h-[500px] flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10 text-center">
                            <Zap size={120} className="mx-auto mb-8 text-yellow-300" />
                            <h3 className="text-3xl font-black mb-4">50k+ Products</h3>
                            <p className="text-brand-100 font-bold">Reviewed and Curated for you.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-brand-500/10 blur-3xl rounded-full translate-y-1/2"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <Users size={64} className="mx-auto mb-8 text-brand-400" />
                    <h2 className="text-4xl font-black mb-6">Transparency Matters</h2>
                    <p className="text-xl text-gray-400 font-medium leading-relaxed mb-10">
                        We are a registered affiliate partner with top networks. Our revenue comes from commissions, which we share back with our community through our unique rewards system. This ensures that DropBest! stays free and valuable for everyone.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 opacity-60">
                        <span className="font-black tracking-widest text-xs uppercase">Amazon Associates Program</span>
                        <span className="font-black tracking-widest text-xs uppercase">Flipkart Affiliate Network</span>
                        <span className="font-black tracking-widest text-xs uppercase">AbhiBus Partner Program</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
