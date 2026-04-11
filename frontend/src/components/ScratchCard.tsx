'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Gift, Lock, Sparkles } from 'lucide-react';

interface ScratchCardProps {
    id: string;
    coins: number;
    isLocked?: boolean;
    onComplete: (id: string) => void;
}

export default function ScratchCard({ id, coins, isLocked = false, onComplete }: ScratchCardProps) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showScratch, setShowScratch] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastCheckTime = useRef<number>(0);

    const initCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Set dimensions based on container parent
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }

        // Draw cover (silver/shimmer)
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#d1d5db');
        gradient.addColorStop(0.5, '#f3f4f6');
        gradient.addColorStop(1, '#9ca3af');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add pattern/text on cover
        ctx.fillStyle = '#4b5563';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2);
    }, []);

    useEffect(() => {
        if (showScratch) {
            // Short delay to ensure DOM is ready
            const timer = setTimeout(initCanvas, 50);
            return () => clearTimeout(timer);
        }
    }, [showScratch, initCanvas]);

    const checkScratched = useCallback(() => {
        if (!canvasRef.current || isRevealed) return;
        
        // Throttle check to every 150ms for performance
        const now = Date.now();
        if (now - lastCheckTime.current < 150) return;
        lastCheckTime.current = now;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        // Step by 32 to sample fewer pixels (huge performance boost)
        for (let i = 0; i < data.length; i += 32) {
            if (data[i + 3] === 0) count++;
        }

        const percent = (count / (data.length / 32)) * 100;
        if (percent > 40 && !isRevealed) {
            setIsRevealed(true);
            setTimeout(() => {
                onComplete(id);
            }, 1000);
        }
    }, [id, isRevealed, onComplete]);

    const handleScratch = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current || isRevealed || (!isDragging && e.type !== 'touchmove')) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        checkScratched();
    };

    const handleUnlock = () => {
        if (isLocked) return;
        setIsAnimating(true);
        setTimeout(() => {
            setShowScratch(true);
            setIsAnimating(false);
        }, 800);
    };

    return (
        <div className="relative w-full aspect-[4/3] max-w-sm mx-auto perspective-1000">
            <AnimatePresence mode="wait">
                {!showScratch ? (
                    <motion.div
                        key="locked-card"
                        initial={{ rotateY: 0 }}
                        animate={{ 
                            rotateY: isAnimating ? 90 : 0,
                            scale: isAnimating ? 1.1 : 1
                        }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        onClick={handleUnlock}
                        className={`w-full h-full rounded-[2rem] flex flex-col items-center justify-center p-8 cursor-pointer shadow-xl border-4 ${
                            isLocked 
                            ? 'bg-gray-100 border-gray-200' 
                            : 'bg-gradient-to-br from-indigo-600 to-violet-700 border-white/20'
                        }`}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <motion.div
                            animate={!isLocked ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`${isLocked ? 'text-gray-300' : 'text-white'}`}
                        >
                            {isLocked ? <Lock size={64} /> : <Gift size={64} className="drop-shadow-lg" />}
                        </motion.div>
                        
                        <h3 className={`mt-4 text-xl font-black ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                            {isLocked ? 'Locked Bonus' : 'Mystery Reward!'}
                        </h3>
                        <p className={`text-center text-xs font-bold mt-2 uppercase tracking-widest ${isLocked ? 'text-gray-400' : 'text-indigo-100'}`}>
                            {isLocked ? 'Please purchase to reveal' : 'Tap to open card'}
                        </p>

                        {!isLocked && (
                            <div className="absolute top-4 right-4 text-white/20">
                                <Sparkles size={32} />
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="scratch-area"
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        className="w-full h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-brand-500 relative"
                    >
                        {/* Reward Content (Hidden Under Canvas) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-white">
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-4 border-2 border-brand-400 shadow-inner">
                                    <Gem className="text-brand-600" size={40} />
                                </div>
                                <h4 className="text-brand-800 text-sm font-black uppercase tracking-widest">You Won!</h4>
                                <span className="text-5xl font-black text-gray-900 mt-2">{coins}</span>
                                <span className="text-gray-500 font-bold text-sm">COINS</span>
                            </motion.div>
                        </div>

                        {/* Interactive Canvas Cover */}
                        <canvas
                            ref={canvasRef}
                            onMouseDown={() => setIsDragging(true)}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                            onMouseMove={handleScratch}
                            onTouchStart={() => setIsDragging(true)}
                            onTouchEnd={() => setIsDragging(false)}
                            onTouchMove={handleScratch}
                            className={`absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        />

                        {isRevealed && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-6 left-0 w-full text-center"
                            >
                                <span className="text-brand-600 font-black text-xs bg-brand-50 px-4 py-2 rounded-full border border-brand-100 animate-pulse">
                                    COINS ADDED TO WALLET! ✨
                                </span>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
