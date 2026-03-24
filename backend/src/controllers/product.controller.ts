import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { scrapePrice } from '../utils/scraper';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabaseAdmin.from('products').select('*');
        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }
        res.json(data);
    } catch (err: any) {
        console.error('Fetch Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { title, description, price, image_url, amazon_link, flipkart_link } = req.body;
        const { data, error } = await supabaseAdmin.from('products').insert([{ title, description, price, image_url, amazon_link, flipkart_link }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, price, image_url, amazon_link, flipkart_link } = req.body;
        const { data, error } = await supabaseAdmin.from('products').update({ title, description, price, image_url, amazon_link, flipkart_link }).eq('id', id).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const syncPrices = async (req: Request, res: Response) => {
    try {
        const { data: products, error: prodError } = await supabaseAdmin.from('products').select('*');
        if (prodError) throw prodError;

        const results: any[] = [];
        
        // Process in batches to avoid overwhelming external sites or memory
        const batchSize = 5;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (product) => {
                let scrapedPrice: number | null = null;
                let scrapedRating: number | null = null;
                let scrapedReviewCount: string | null = null;
                
                const links = [product.amazon_link, product.flipkart_link].filter(Boolean);
                
                for (const link of links) {
                    try {
                        const result = await scrapePrice(link);
                        if (result.success) {
                            scrapedPrice = result.price;
                            scrapedRating = result.rating;
                            scrapedReviewCount = result.reviewCount;
                            if (scrapedPrice) break;
                        }
                    } catch (err) {
                        console.error(`Failed to scrape ${link}:`, err);
                    }
                }

                if (scrapedPrice !== null) {
                    const oldPrice = product.price;
                    const isPriceDrop = scrapedPrice < oldPrice;

                    // Update Product
                    await supabaseAdmin
                        .from('products')
                        .update({ 
                            old_price: oldPrice, 
                            price: scrapedPrice,
                            external_rating: scrapedRating,
                            external_review_count: scrapedReviewCount,
                            last_scraped_at: new Date().toISOString() 
                        })
                        .eq('id', product.id);

                    // Notification logic
                    if (isPriceDrop) {
                        const { data: watchers } = await supabaseAdmin
                            .from('watchlist')
                            .select('user_id')
                            .eq('product_id', product.id);

                        if (watchers && watchers.length > 0) {
                            const notifications = watchers.map(w => ({
                                user_id: w.user_id,
                                message: `Price Drop! "${product.title}" is now ₹${scrapedPrice?.toLocaleString()} (was ₹${oldPrice.toLocaleString()})`,
                                type: 'PRICE_DROP',
                                action_data: { product_id: product.id, new_price: scrapedPrice }
                            }));
                            await supabaseAdmin.from('notifications').insert(notifications);
                        }
                    }

                    return { id: product.id, title: product.title, old: oldPrice, new: scrapedPrice };
                }
                return null;
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter(Boolean));
        }

        res.json({ message: 'Sync completed', updated: results });
    } catch (err: any) {
        console.error('Sync Error:', err);
        res.status(500).json({ error: err.message });
    }
};
