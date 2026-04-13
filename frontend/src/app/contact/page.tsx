'use client';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Instagram } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            subject: formData.get('subject') as string,
            message: formData.get('message') as string,
        };

        try {
            await api.post('/contacts', data);
            toast.success("Message sent successfully! We'll get back to you soon.");
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Get in Touch</h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
                    Have questions about a product or our rewards system? We're here to help you shop smarter.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brand-100 text-brand-600 rounded-2xl">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Email Us</h3>
                                <p className="text-gray-500">dropbest2@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-2xl">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Live Chat</h3>
                                <p className="text-gray-500">Available 10 AM - 6 PM</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Location</h3>
                                <p className="text-gray-500">Tamil Nadu, India</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-brand-600 to-violet-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-4">Join Our Community</h3>
                            <p className="text-brand-100 mb-6 font-medium">Follow us for the latest product reviews and exclusive reward updates.</p>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                                    <span className="font-black">𝕏</span>
                                </div>
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
                                    <Instagram size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </motion.div>
                </div>

                {/* Contact Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    name="name"
                                    placeholder="John Doe"
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <input 
                                    required
                                    type="email" 
                                    name="email"
                                    placeholder="john@example.com"
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                            <input 
                                required
                                type="text" 
                                name="subject"
                                placeholder="How can we help?"
                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                            <textarea 
                                required
                                rows={5}
                                name="message"
                                placeholder="Tell us more about your inquiry..."
                                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium resize-none"
                            ></textarea>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            className={`w-full py-5 rounded-2xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'bg-gray-400' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'}`}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Send Message <Send size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
