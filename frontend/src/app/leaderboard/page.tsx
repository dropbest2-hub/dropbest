'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

interface LeaderboardUser {
    id: string;
    name: string | null;
    avatar_url: string | null;
    user_level: string;
    badge_count: number;
}

interface CurrentUserInfo extends LeaderboardUser {
    rank: number;
}

export default function Leaderboard() {
    const [top3, setTop3] = useState<LeaderboardUser[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<CurrentUserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/users/leaderboard');
                setTop3(response.data.top3);
                setCurrentUserRank(response.data.currentUser);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

 const getMedalColor = (index: number) => {
 switch (index) {
 case 0: return 'text-yellow-400';
 case 1: return 'text-gray-300';
 case 2: return 'text-amber-600';
 default: return 'text-violet-400';
 }
 };

 return (
 <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
 <div className="text-center mb-16">
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="inline-block p-4 bg-violet-600 text-white rounded-3xl shadow-xl shadow-violet-500/20 mb-6"
 >
 <Trophy size={48} />
 </motion.div>
 <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
 Community <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Leaderboard</span>
 </h1>
 <p className="text-gray-500 font-medium text-lg">Celebrating our top 3 most active shoppers this week.</p>
 </div>

 {loading ? (
 <div className="space-y-4">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100"></div>
 ))}
 </div>
 ) : (
 <div className="space-y-6">
 {/* Top 3 List */}
 <div className="space-y-4">
 {top3.map((user, index) => (
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 key={user.id}
 className={`relative overflow-hidden group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-xl hover:-translate-y-1 ${index < 3 ? 'border-violet-100 bg-gradient-to-r from-white to-violet-50/30' : ''}`}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />

 <div className="flex-shrink-0 w-12 text-center">
 <span className={`text-2xl font-black ${getMedalColor(index)}`}>
 <Medal size={28} className="mx-auto" />
 </span>
 </div>

 <div className="flex-shrink-0 relative">
 {user.avatar_url ? (
 <Image src={user.avatar_url} alt="" width={64} height={64} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" />
 ) : (
 <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-xl font-bold uppercase">
 {user.name?.charAt(0) || <UserIcon size={32} />}
 </div>
 )}
 {index === 0 && <Crown className="absolute -top-3 -right-3 text-yellow-400 rotate-12 drop-shadow-md" size={24} />}
 </div>

 <div className="flex-grow">
 <h3 className="text-xl font-black text-gray-900">{user.name || 'Anonymous User'}</h3>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">
 {user.user_level}
 </span>
 <span className="text-xs font-bold px-2 py-0.5 bg-violet-600 text-white rounded-md uppercase tracking-wider">
 Rank #{index + 1}
 </span>
 </div>
 </div>

 <div className="text-right">
 <div className="flex items-center gap-2 justify-end text-violet-600 font-black text-2xl">
 <TrendingUp size={24} />
 {user.badge_count}
 </div>
 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Badges</p>
 </div>
 </motion.div>
 ))}
 </div>

 {/* Personal Rank Section at Bottom */}
 {currentUserRank && (
 <motion.div
 initial={{ opacity: 0, y: 50 }}
 animate={{ opacity: 1, y: 0 }}
 className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6"
 >
 <div className="bg-gray-900/95 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-black/30 flex items-center justify-between border border-white/10 backdrop-blur-xl">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center font-black text-xl">
 #{currentUserRank.rank}
 </div>
 <div>
 <p className="text-[10px] font-black text-violet-300 uppercase tracking-widest leading-none mb-1">Your Position</p>
 <h4 className="font-bold text-lg leading-tight">{currentUserRank.name || 'Your Rank'}</h4>
 </div>
 </div>
 <div className="text-right">
 <div className="flex items-center gap-2 justify-end text-2xl font-black text-violet-400">
 <Trophy size={20} />
 {currentUserRank.badge_count}
 </div>
 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Ranking</p>
 </div>
 </div>
 </motion.div>
 )}
 </div>
 )}
 </div>
 );
}
