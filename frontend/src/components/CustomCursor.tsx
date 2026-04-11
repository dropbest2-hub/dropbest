'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
}

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const nextId = useRef(0);

    const cursorX = useSpring(0, { damping: 30, stiffness: 500 });
    const cursorY = useSpring(0, { damping: 30, stiffness: 500 });
    
    const ringX = useSpring(0, { damping: 20, stiffness: 300 });
    const ringY = useSpring(0, { damping: 20, stiffness: 300 });

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            cursorX.set(e.clientX - 3);
            cursorY.set(e.clientY - 3);
            ringX.set(e.clientX - 12);
            ringY.set(e.clientY - 12);

            // Subtle sparkle trail
            if (Math.random() > 0.9) {
                const id = nextId.current++;
                setParticles(prev => [...prev.slice(-10), { id, x: e.clientX, y: e.clientY }]);
                setTimeout(() => {
                    setParticles(prev => prev.filter(p => p.id !== id));
                }, 800);
            }
        };

        const checkHover = () => {
            const hoveredEl = document.querySelectorAll('button, a, input, [role="button"], .interactive');
            hoveredEl.forEach(el => {
                el.addEventListener('mouseenter', () => setIsHovering(true));
                el.addEventListener('mouseleave', () => setIsHovering(false));
            });
        };

        window.addEventListener('mousemove', mouseMove);
        checkHover();

        const observer = new MutationObserver(checkHover);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', mouseMove);
            observer.disconnect();
        };
    }, [cursorX, cursorY, ringX, ringY]);

    return (
        <>
            {/* Minimal Sparkle Trail */}
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 0, scale: 0, y: p.y + 10 }}
                        exit={{ opacity: 0 }}
                        className="fixed w-1 h-1 bg-brand-400 rounded-full z-[9990] pointer-events-none hidden md:block"
                        style={{ left: p.x, top: p.y }}
                    />
                ))}
            </AnimatePresence>

            {/* Main Small Dot */}
            <motion.div
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-brand-600 rounded-full pointer-events-none z-[9999] hidden md:block"
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
            />

            {/* Stylish Outer Ring */}
            <motion.div
                className="fixed top-0 left-0 w-6 h-6 border border-brand-500/50 rounded-full pointer-events-none z-[9998] hidden md:block"
                style={{
                    x: ringX,
                    y: ringY,
                }}
                animate={{
                    scale: isHovering ? 1.8 : 1,
                    borderColor: isHovering ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.3)',
                    backgroundColor: isHovering ? 'rgba(139, 92, 246, 0.1)' : 'transparent'
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />

            <style jsx global>{`
                @media (min-width: 768px) {
                    * {
                        cursor: none !important;
                    }
                }
            `}</style>
        </>
    );
}
