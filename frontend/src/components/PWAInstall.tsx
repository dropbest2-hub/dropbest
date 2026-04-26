'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstall() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show the banner after 3 seconds for better UX
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleDownloadClick = () => {
        const link = document.createElement('a');
        link.href = '/dropbest.apk';
        link.download = 'dropbest.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <img src="/icon-options/icon-option-2.png?v=2" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">Download DropBest!</h3>
                            <p className="text-xs text-gray-500">Get the full mobile experience</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadClick}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Download size={16} />
                            Install
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
