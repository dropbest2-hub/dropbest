'use client';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-flex p-4 bg-brand-100 text-brand-600 rounded-3xl mb-6">
                    <FileText size={48} />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Terms of Service</h1>
                <p className="text-xl text-gray-500 font-medium">Please read these terms carefully before using DropBest.</p>
            </motion.div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 md:p-12 space-y-12">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                            Agreement to Terms
                        </h2>
                        <div className="text-gray-600 leading-relaxed font-medium space-y-4">
                            <p>By accessing or using DropBest, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                            User Accounts and Rewards
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium space-y-3">
                            <ul className="list-none space-y-3 mt-4">
                                {[
                                    "You must provide accurate and complete information when creating an account.",
                                    "Rewards (coins) have no cash value outside of our platform.",
                                    "We reserve the right to suspend accounts or revoke coins if fraudulent activity is suspected.",
                                    "Conversion rates of coins to API rewards or coupons are subject to change."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <CheckCircle size={20} className="text-brand-500 shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                            Affiliate Disclaimer
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            DropBest participates in various affiliate marketing programs, which means we may get paid commissions on editorially chosen products purchased through our links to retailer sites like Amazon and Flipkart. This does not affect the price you pay.
                        </p>
                    </section>

                    <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
                        <div className="flex items-center gap-4 mb-4">
                            <AlertCircle className="text-red-600" />
                            <h2 className="text-xl font-black text-gray-900">Limitation of Liability</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            DropBest acts solely as an aggregator and affiliate. We are not responsible for product quality, delivery issues, refunds, or customer service concerning any items purchased from third-party retailers via our links. All such issues must be directed to the respective retailer.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Changes to Terms</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                        </p>
                        <p className="text-sm font-bold text-gray-400 mt-8 uppercase tracking-widest">Last Updated: April 16, 2026</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
