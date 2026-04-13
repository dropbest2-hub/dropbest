'use client';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-flex p-4 bg-brand-100 text-brand-600 rounded-3xl mb-6">
                    <Shield size={48} />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Privacy Policy</h1>
                <p className="text-xl text-gray-500 font-medium">Your privacy is our priority. Learn how we handle your data.</p>
            </motion.div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 md:p-12 space-y-12">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center text-sm">1</span>
                            Information We Collect
                        </h2>
                        <div className="text-gray-600 leading-relaxed font-medium space-y-4">
                            <p>At DropBest, we collect minimal information to provide you with the best experience:</p>
                            <ul className="list-none space-y-3">
                                {[
                                    "Personal information you provide (Name, Email) when creating an account.",
                                    "Usage data such as products viewed and rewards earned.",
                                    "Device information and cookies to improve site performance."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <CheckCircle size={20} className="text-brand-500 shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center text-sm">2</span>
                            How We Use Your Data
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We use your information to personalize your shopping experience, track your reward progress, and send you important updates about your account. We never sell your data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center text-sm">3</span>
                            Cookies & Affiliate Tracking
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We use cookies to track affiliate referrals. When you click on an Amazon or Flipkart link, a cookie is stored on your device for a specific duration (as per the retailer's policy) to ensure we receive credit for the referral. This does not affect the price you pay.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <Lock className="text-brand-600" />
                            <h2 className="text-xl font-black text-gray-900">Data Security</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Changes to This Policy</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </p>
                        <p className="text-sm font-bold text-gray-400 mt-8 uppercase tracking-widest">Last Updated: April 13, 2026</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
