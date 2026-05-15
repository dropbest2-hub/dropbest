'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Smartphone, Bus, Star } from 'lucide-react';
import Link from 'next/link';

interface BannerSlide {
    id: string;
    content: React.ReactNode;
    background: string;
}

export default function BannerCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const slides: BannerSlide[] = [
        {
            id: 'bus-booking',
            background: 'bg-gradient-to-br from-orange-600 via-red-500 to-rose-600',
            content: (
                <div className="relative h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-8 gap-4 md:gap-10">
                    <div className="text-white max-w-2xl text-center md:text-left z-10">
                        <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[8px] font-black tracking-[0.2em] uppercase shadow-lg shadow-yellow-400/20">NEW FEATURE</span>
                            <div className="flex gap-1 items-center bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                <Star size={8} fill="#facc15" className="text-yellow-400" />
                                <span className="text-[8px] font-bold opacity-80">5.0</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black mb-2 leading-tight tracking-tight">
                            Travel & <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-100 drop-shadow-sm">Earn Coins</span>
                        </h2>
                        <p className="text-orange-50 text-xs md:text-base font-medium mb-6 opacity-90 max-w-lg leading-relaxed">
                            Book tickets via <span className="font-bold text-white">RedBus & AbhiBus</span>. Get exclusive rewards on every ride!
                        </p>
                        <div className="flex justify-center md:justify-start">
                            <Link href="/bus-booking" className="bg-white text-orange-600 px-8 py-3 rounded-xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm">
                                Book Now <ChevronRight size={16} strokeWidth={3} />
                            </Link>
                        </div>
                    </div>
                    <div className="relative flex-shrink-0 z-10 hidden lg:block">
                        <motion.div 
                            animate={{ y: [0, -10, 0], rotate: [2, 0, 2] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                        >
                            <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/20 shadow-2xl">
                                <Bus size={100} className="text-white drop-shadow-[0_10px_30px_rgba(255,255,255,0.3)]" strokeWidth={1} />
                            </div>
                            <motion.div animate={{ y: [0, -10, 0], rotate: [0, 360, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
                                <span className="text-white font-black text-lg">₵</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            )
        },
        {
            id: 'app-download',
            background: 'bg-gradient-to-br from-violet-600 via-indigo-600 to-brand-700',
            content: (
                <div className="relative h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-8 gap-4 md:gap-10">
                    <div className="text-white max-xl text-center md:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[8px] font-black uppercase tracking-widest mb-4 border border-white/10">
                            <Smartphone size={12} /> MOBILE APP AVAILABLE
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">
                            Shop on the go with <span className="text-brand-300">DropBest!</span>
                        </h2>
                        <p className="text-indigo-100 font-medium text-xs md:text-base leading-relaxed mb-6 opacity-90">
                            Get exclusive mobile-only rewards and instant notifications. Download the APK directly.
                        </p>
                        <div className="flex justify-center md:justify-start">
                            <motion.a 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="https://expo.dev/artifacts/eas/ofV4pJ51pT4TokjDz48rTz.apk" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-white text-indigo-900 font-black px-8 py-3 rounded-xl shadow-xl hover:bg-gray-50 transition-all group"
                            >
                                <Smartphone size={20} />
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[8px] opacity-60 font-bold uppercase tracking-widest leading-none mb-1">Download</span>
                                    <span className="text-sm leading-none">Android APK</span>
                                </div>
                            </motion.a>
                        </div>
                    </div>
                    <div className="relative w-full max-w-[150px] aspect-[9/16] bg-gray-900 rounded-[2rem] border-[4px] border-gray-800 shadow-2xl overflow-hidden hidden md:block">
                        <div className="absolute inset-0 bg-brand-600 flex flex-col items-center justify-center p-3 text-center">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-xl">
                                <span className="text-xl font-black text-brand-600">D</span>
                            </div>
                            <h3 className="text-white text-base font-black leading-tight">DropBest!</h3>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, []);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9
        })
    };

    return (
        <section className="px-4 sm:px-6 mb-12 relative group">
            <div className="max-w-7xl mx-auto relative h-[320px] md:h-[350px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.4 }
                        }}
                        className={`absolute inset-0 ${slides[currentIndex].background}`}
                    >
                        {/* Shared decorative elements */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-black/20 rounded-full blur-[60px]"></div>

                        {slides[currentIndex].content}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-10 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <button 
                        onClick={(e) => { e.preventDefault(); prevSlide(); }}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all pointer-events-auto shadow-lg"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); nextSlide(); }}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all pointer-events-auto shadow-lg"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
