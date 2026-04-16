'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function AuthPage() {
    const { signInWithGoogle, loading, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push(user.role === 'ADMIN' ? '/admin' : '/profile');
        }
    }, [user, router]);

    if (user) {
        return null; // Don't render the form if logged in
    }

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
 Join thousands of smart shoppers who earn coins and redeem exclusive coupons.
 </p>
 </div>

 <div className="relative z-10 flex flex-col gap-4">
 {[
 { icon: '🏅', text: 'Earn coins on every purchase' },
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

 <div className="mb-10 text-center md:text-left">
     <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
         Welcome back 👋
     </h1>
     <p className="text-gray-500 font-medium">
         Sign in with Google to start earning rewards instantly securely.
     </p>
 </div>

 <div className="space-y-6 mb-8 mt-12 w-full">
     <motion.button
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         onClick={() => signInWithGoogle()}
         disabled={loading}
         className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md text-gray-800 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-4"
     >
         {loading ? (
             <Loader2 className="animate-spin text-gray-400" size={24} />
         ) : (
             <>
                 <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                 Continue with Google
             </>
         )}
     </motion.button>
 </div>

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
