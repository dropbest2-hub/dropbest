import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/categories';

interface CategoryListProps {
    activeCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ activeCategory, onCategoryChange }) => {
    return (
        <div className="w-full overflow-x-auto no-scrollbar py-6 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-start gap-6 px-4 md:px-0 min-w-max">
                {CATEGORIES.map((category) => (
                    <motion.button
                        key={category.id}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCategoryChange(category.id)}
                        className="flex flex-col items-center gap-3 group outline-none w-20"
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm
                            ${activeCategory === category.id 
                                ? `${category.color} ring-4 ring-white shadow-xl scale-110` 
                                : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                            {category.icon}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors text-center leading-tight h-5 overflow-hidden
                            ${activeCategory === category.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}
                        >
                            {category.name}
                        </span>
                        {activeCategory === category.id && (
                            <motion.div 
                                layoutId="active-pill"
                                className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-[-4px]"
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
