import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/categories';

interface CategoryListProps {
    activeCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ activeCategory, onCategoryChange }) => {
    return (
        <div className="w-full overflow-x-auto no-scrollbar py-8 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ perspective: '1000px' }}>
            <div className="flex items-start gap-8 px-4 md:px-0 min-w-max">
                {CATEGORIES.map((category) => {
                    const isStore = ['amazon', 'flipkart', 'myntra'].includes(category.id);
                    
                    return (
                        <motion.button
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ 
                                y: -12,
                                rotateY: isStore ? 15 : 0,
                                rotateX: isStore ? -10 : 0,
                                scale: 1.1,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCategoryChange(category.id)}
                            className="flex flex-col items-center gap-4 group outline-none w-24 relative"
                        >
                            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-sm relative overflow-hidden
                                ${activeCategory === category.id 
                                    ? `${category.color} ring-4 ring-white shadow-2xl scale-110` 
                                    : 'bg-white text-gray-400 hover:text-gray-600 hover:shadow-xl'}`}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    boxShadow: activeCategory === category.id ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : ''
                                }}
                            >
                                {/* 3D Glow for stores */}
                                {isStore && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                                
                                <div className="z-10 transition-transform duration-500 group-hover:translate-z-10 group-hover:scale-110">
                                    {category.icon}
                                </div>

                                {activeCategory === category.id && (
                                    <motion.div 
                                        layoutId="active-bg"
                                        className="absolute inset-0 bg-current opacity-10"
                                    />
                                )}
                            </div>
                            
                            <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors text-center leading-tight
                                ${activeCategory === category.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}
                            >
                                {category.name}
                            </span>

                            {activeCategory === category.id && (
                                <motion.div 
                                    layoutId="active-pill"
                                    className="w-2 h-2 rounded-full bg-brand-600 mt-[-4px]"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryList;
