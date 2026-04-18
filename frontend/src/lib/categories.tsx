import React from 'react';
import { 
    Smartphone, 
    Shirt, 
    Home, 
    Utensils, 
    Watch, 
    Camera, 
    Gift, 
    Zap,
    Laptop,
    Gamepad2,
    Monitor,
    Mouse,
    Backpack,
    Sofa,
    Hammer,
    Flower2,
    Sparkles,
    Stethoscope,
    Baby,
    Puzzle,
    Apple,
    Dog,
    Book,
    Film,
    Music as MusicIcon,
    Car,
    Trophy,
    Briefcase,
    Beaker,
    ShoppingBag
} from 'lucide-react';

export interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    group: string;
}

export const CATEGORIES: Category[] = [
    { id: 'all', name: 'All', icon: <Zap size={24} />, color: 'bg-violet-100 text-violet-600', group: 'All' },
    
    // Store Categories (Special)
    { id: 'amazon', name: 'Amazon', icon: <ShoppingBag size={24} />, color: 'bg-orange-100 text-[#FF9900]', group: 'Stores' },
    { id: 'flipkart', name: 'Flipkart', icon: <ShoppingBag size={24} />, color: 'bg-blue-100 text-[#2874F0]', group: 'Stores' },
    { id: 'myntra', name: 'Myntra', icon: <ShoppingBag size={24} />, color: 'bg-pink-100 text-[#ff3f6c]', group: 'Stores' },
    
    // Electronics & Tech
    { id: 'electronics', name: 'Electronics', icon: <Smartphone size={24} />, color: 'bg-blue-100 text-blue-600', group: 'Electronics' },
    { id: 'computers', name: 'Computers', icon: <Monitor size={24} />, color: 'bg-indigo-100 text-indigo-600', group: 'Electronics' },
    { id: 'phones', name: 'Cell Phones', icon: <Smartphone size={24} />, color: 'bg-sky-100 text-sky-600', group: 'Electronics' },
    { id: 'camera', name: 'Camera', icon: <Camera size={24} />, color: 'bg-teal-100 text-teal-600', group: 'Electronics' },
    { id: 'gaming', name: 'Video Games', icon: <Gamepad2 size={24} />, color: 'bg-purple-100 text-purple-600', group: 'Electronics' },
    { id: 'software', name: 'Software', icon: <Laptop size={24} />, color: 'bg-blue-100 text-blue-700', group: 'Electronics' },

    // Fashion & Lifestyle
    { id: 'clothing', name: 'Clothing', icon: <Shirt size={24} />, color: 'bg-pink-100 text-pink-600', group: 'Fashion' },
    { id: 'bags', name: 'Bags & Luggage', icon: <Backpack size={24} />, color: 'bg-rose-100 text-rose-600', group: 'Fashion' },
    { id: 'watches', name: 'Watches', icon: <Watch size={24} />, color: 'bg-cyan-100 text-cyan-600', group: 'Fashion' },

    // Home & Living
    { id: 'home-kitchen', name: 'Home & Kitchen', icon: <Utensils size={24} />, color: 'bg-orange-100 text-orange-600', group: 'Home' },
    { id: 'furniture', name: 'Furniture', icon: <Sofa size={24} />, color: 'bg-amber-100 text-amber-600', group: 'Home' },
    { id: 'home-improvement', name: 'Improvement', icon: <Hammer size={24} />, color: 'bg-emerald-100 text-emerald-600', group: 'Home' },
    { id: 'tools', name: 'Tools', icon: <Hammer size={24} />, color: 'bg-gray-100 text-gray-600', group: 'Home' },
    { id: 'garden', name: 'Garden', icon: <Flower2 size={24} />, color: 'bg-green-100 text-green-600', group: 'Home' },

    // Beauty & Personal Care
    { id: 'beauty', name: 'Beauty', icon: <Sparkles size={24} />, color: 'bg-fuchsia-100 text-fuchsia-600', group: 'Beauty' },
    { id: 'health', name: 'Health', icon: <Stethoscope size={24} />, color: 'bg-red-100 text-red-600', group: 'Beauty' },
    { id: 'personal-care', name: 'Appliances', icon: <Mouse size={24} />, color: 'bg-pink-50 text-pink-500', group: 'Beauty' },

    // Baby & Kids
    { id: 'baby', name: 'Baby Products', icon: <Baby size={24} />, color: 'bg-blue-50 text-blue-500', group: 'Baby' },
    { id: 'toys', name: 'Toys', icon: <Puzzle size={24} />, color: 'bg-yellow-100 text-yellow-600', group: 'Baby' },

    // Food & Daily Needs
    { id: 'grocery', name: 'Grocery', icon: <Apple size={24} />, color: 'bg-green-100 text-green-700', group: 'Food' },

    // Pets
    { id: 'pets', name: 'Pet Supplies', icon: <Dog size={24} />, color: 'bg-orange-100 text-orange-700', group: 'Pets' },

    // Media & Entertainment
    { id: 'books', name: 'Books', icon: <Book size={24} />, color: 'bg-yellow-50 text-yellow-700', group: 'Media' },
    { id: 'movies', name: 'Movies & TV', icon: <Film size={24} />, color: 'bg-red-50 text-red-700', group: 'Media' },
    { id: 'music', name: 'Music', icon: <MusicIcon size={24} />, color: 'bg-indigo-50 text-indigo-700', group: 'Media' },

    // Automotive
    { id: 'automotive', name: 'Automotive', icon: <Car size={24} />, color: 'bg-slate-100 text-slate-700', group: 'Automotive' },

    // Sports & Fitness
    { id: 'sports', name: 'Sports', icon: <Trophy size={24} />, color: 'bg-lime-100 text-lime-700', group: 'Sports' },

    // Office & Industrial
    { id: 'office', name: 'Office Items', icon: <Briefcase size={24} />, color: 'bg-cyan-50 text-cyan-700', group: 'Office' },
    { id: 'industrial', name: 'Industrial', icon: <Beaker size={24} />, color: 'bg-indigo-100 text-indigo-800', group: 'Office' },
];
