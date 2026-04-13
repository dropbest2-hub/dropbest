'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, ShoppingBag, ExternalLink } from 'lucide-react';

export default function DisclaimerPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-flex p-4 bg-orange-100 text-orange-600 rounded-3xl mb-6">
                    <AlertTriangle size={48} />
                </div>
                <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Disclaimer</h1>
                <p className="text-xl text-gray-500 font-medium">Important information regarding our affiliate partnerships and content.</p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8">
                {/* Affiliate Disclosure */}
                <motion.section 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-violet-600 to-brand-600 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-6">Affiliate Disclosure</h2>
                        <div className="space-y-4 text-brand-50 font-medium text-lg leading-relaxed">
                            <p>
                                <strong>DropBest</strong> is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in.
                            </p>
                            <p>
                                As an Amazon Associate, we earn from qualifying purchases. This means that if you click on a product link and make a purchase, we may receive a small commission at no additional cost to you.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl w-fit">
                            <ShoppingBag className="text-white" />
                            <span className="font-bold">Transparent & Honestly Curated</span>
                        </div>
                    </div>
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </motion.section>

                {/* Other Info */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 md:p-12 space-y-12">
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <Info className="text-brand-600" />
                            Product Information
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            While we strive to provide accurate and up-to-date information, product prices, availability, and specifications are subject to change by the retailer without notice. Always verify the details on the retailer's website before making a purchase. 
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                            <ExternalLink className="text-brand-600" />
                            External Links
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            Our website contains links to external websites that are not provided or maintained by or in any way affiliated with DropBest. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
                        </p>
                    </section>

                    <section className="border-t border-gray-100 pt-10">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">No Warranties</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            The information on this website is provided "as is" without any representations or warranties, express or implied. DropBest makes no representations or warranties in relation to this website or the information and materials provided on this website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
