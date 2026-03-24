'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
 const { signInWithEmail, signUpWithEmail, loading, user } = useAuthStore();
 const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [name, setName] = useState('');

 if (user) {
 window.location.href = user.role === 'ADMIN' ? '/admin' : '/profile';
 return null;
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (loading) return; // Prevent double submission while loading

 try {
 let loggedInUser;
 if (activeTab === 'login') {
 loggedInUser = await signInWithEmail(email, password);
 toast.success('Successfully signed in!');
 } else {
 loggedInUser = await signUpWithEmail(email, password, name);
 toast.success('Account created successfully!');
 }
 
 // The rest of the logic...
 if (loggedInUser?.role === 'ADMIN') {
 window.location.href = '/admin';
 } else if (loggedInUser) {
 window.location.href = '/profile';
 }
 } catch (error: any) {
 toast.error(error.message || 'Authentication failed');
 }
 };

 return (
 <div className="flex min-h-[90vh]">
 {/* Left branding panel — hidden on mobile */}
 <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900 text-white flex-col justify-between p-12 relative overflow-hidden">
 {/* Blobs */}
 <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl" />
 <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-fuchsia-500/30 rounded-full blur-3xl" />

 <div className="relative z-10">
 <div className="flex items-center gap-3 mb-16">
 <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
 <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2"/><path d="M16 10a4 4 0 0 1-8 0" stroke="white" strokeWidth="2" fill="none"/></svg>
 </div>
 <span className="font-black text-2xl tracking-tight">DropBest!</span>
 </div>
 <h2 className="text-4xl font-black leading-tight mb-6">
 Discover.<br />Earn.<br />
 <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">Reward.</span>
 </h2>
 <p className="text-violet-200 leading-relaxed font-medium">
 Join thousands of smart shoppers who earn badges and redeem exclusive coupons.
 </p>
 </div>

 <div className="relative z-10 flex flex-col gap-4">
 {[
 { icon: '🏅', text: 'Earn badges on every purchase' },
 { icon: '🎁', text: 'Redeem rewards as coupons' },
 { icon: '⭐', text: 'Write verified product reviews' },
 ].map(item => (
 <div key={item.text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
 <span className="text-2xl">{item.icon}</span>
 <span className="text-sm font-semibold text-violet-100">{item.text}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Right form panel */}
 <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#f8f7ff]">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="w-full max-w-md"
 >
 <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-400 hover:text-violet-600 mb-8 transition-colors group">
 <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Home
 </Link>

 <div className="mb-8">
 <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
 {activeTab === 'login' ? 'Welcome back 👋' : 'Create account 🚀'}
 </h1>
 <p className="text-gray-500 font-medium">
 {activeTab === 'login' ? 'Sign in to continue to DropBest!' : 'Join DropBest! and start earning'}
 </p>
 </div>

 {/* Tabs */}
 <div className="flex p-1 bg-violet-50 rounded-2xl mb-8 border border-violet-100">
 <button
 onClick={() => setActiveTab('login')}
 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'login' ? 'bg-white text-violet-700 shadow-md shadow-violet-100' : 'text-gray-500 hover:text-violet-600'}`}
 >
 Login
 </button>
 <button
 onClick={() => setActiveTab('signup')}
 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'signup' ? 'bg-white text-violet-700 shadow-md shadow-violet-100' : 'text-gray-500 hover:text-violet-600'}`}
 >
 Sign Up
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4 mb-6">
 <AnimatePresence mode="wait">
 {activeTab === 'signup' && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="relative"
 >
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400">
 <User size={18} />
 </div>
 <input
 type="text"
 placeholder="Full Name"
 required={activeTab === 'signup'}
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/15 focus:border-violet-500 outline-none transition-all font-medium"
 />
 </motion.div>
 )}
 </AnimatePresence>

 <div className="relative">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400">
 <Mail size={18} />
 </div>
 <input
 type="email"
 placeholder="Email Address"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/15 focus:border-violet-500 outline-none transition-all font-medium"
 />
 </div>

 <div className="relative">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400">
 <Lock size={18} />
 </div>
 <input
 type="password"
 placeholder="Password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-violet-500/15 focus:border-violet-500 outline-none transition-all font-medium"
 />
 </div>

 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 type="submit"
 disabled={loading}
 className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-violet-500/25 transition-all flex items-center justify-center gap-2"
 >
 {loading ? <Loader2 className="animate-spin" size={20} /> : (activeTab === 'login' ? 'Sign In →' : 'Create Account →')}
 </motion.button>
 </form>

 <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
 By accessing your account, you agree to our
 <span className="text-violet-700 underline mx-1">Terms of Service</span>
 and
 <span className="text-violet-700 underline ml-1">Privacy Policy</span>.
 </p>
 </motion.div>
 </div>
 </div>
 );
}
