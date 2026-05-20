import { Request, Response } from 'express';
import { broadcastPushNotification } from '../utils/notification';
import { supabaseAdmin } from '../config/supabase';
import { scrapePrice } from '../utils/scraper';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        
        let query = supabaseAdmin
            .from('products')
            .select('*, watchlist(count)');
            
        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
            
        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        const now = new Date().getTime();

        // Background cleanup for expired deals
        supabaseAdmin
            .from('products')
            .update({ is_daily_deal: false, deal_expires_at: null, deal_discount_text: null, deal_tag: null })
            .eq('is_daily_deal', true)
            .lt('deal_expires_at', new Date().toISOString())
            .then()
            .catch(console.error);

        // Map data to include a simple watch_count property and override expired deals dynamically
        const productsWithCounts = data.map(p => {
            let isDeal = p.is_daily_deal;
            if (isDeal && p.deal_expires_at) {
                if (now > new Date(p.deal_expires_at).getTime()) {
                    isDeal = false;
                }
            }
            return {
                ...p,
                is_daily_deal: isDeal,
                watch_count: p.watchlist?.[0]?.count || 0
            };
        });

        res.json(productsWithCounts);
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
        const { 
            title, description, price, image_url, 
            amazon_link, flipkart_link, myntra_link, shopsy_link, ajio_link, 
            category, search_keywords,
            is_daily_deal, deal_discount_text, deal_tag, deal_expires_at
        } = req.body;
        
        const { data, error } = await supabaseAdmin.from('products').insert([{ 
            title, description, price, image_url, 
            amazon_link, flipkart_link, myntra_link, shopsy_link, ajio_link, 
            category, search_keywords,
            is_daily_deal: !!is_daily_deal,
            deal_discount_text,
            deal_tag,
            deal_expires_at
        }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            title, description, price, image_url, 
            amazon_link, flipkart_link, myntra_link, shopsy_link, ajio_link, 
            category, search_keywords,
            is_daily_deal, deal_discount_text, deal_tag, deal_expires_at
        } = req.body;
        
        const { data, error } = await supabaseAdmin.from('products').update({ 
            title, description, price, image_url, 
            amazon_link, flipkart_link, myntra_link, shopsy_link, ajio_link, 
            category, search_keywords,
            is_daily_deal,
            deal_discount_text,
            deal_tag,
            deal_expires_at
        }).eq('id', id).select().single();
        
        if (error) throw error;

        // AUTOMATIC NOTIFICATION: If a product was JUST marked as a daily deal
        if (is_daily_deal === true) {
            try {
                // Fetch all users (IDs only for efficiency)
                const { data: users } = await supabaseAdmin.from('users').select('id');
                
                if (users && users.length > 0) {
                    const notifications = users.map(u => ({
                        user_id: u.id,
                        message: `🔥 New Flash Deal: "${title}" is now on sale! Check it out before it expires.`,
                        type: 'DAILY_DEAL',
                        action_data: { product_id: id }
                    }));

                    // Bulk insert notifications
                    await supabaseAdmin.from('notifications').insert(notifications);
                    console.log(`Broadcasted daily deal notification to ${users.length} users.`);

                    // PUSH NOTIFICATION (FCM)
                    await broadcastPushNotification({
                        title: `🔥 Flash Deal Alert!`,
                        body: `"${title}" is now available at a special price. Don't miss out!`,
                        data: { type: 'daily_deal', product_id: id }
                    });
                }
            } catch (notifyErr) {
                console.error('Failed to broadcast daily deal notification:', notifyErr);
                // We don't fail the product update if notification fails
            }
        }

        res.json(data);
    } catch (err: any) {
        console.error('Update Product Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Manually delete related records first to avoid foreign key constraint errors
        // (Use parallel deletes for speed)
        await Promise.all([
            supabaseAdmin.from('price_history').delete().eq('product_id', id),
            supabaseAdmin.from('watchlist').delete().eq('product_id', id),
            supabaseAdmin.from('reviews').delete().eq('product_id', id),
            supabaseAdmin.from('orders').delete().eq('product_id', id)
        ]);

        // Now delete the product itself
        const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
        
        if (error) {
            console.error('Supabase Delete Error:', error);
            throw error;
        }
        
        res.status(204).send();
    } catch (err: any) {
        console.error('Delete Product Exception:', err);
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
                
                const links = [
                    product.amazon_link, 
                    product.flipkart_link, 
                    product.myntra_link, 
                    product.shopsy_link, 
                    product.ajio_link
                ].filter(Boolean);
                
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

                    const updatePayload: any = {
                        old_price: oldPrice, 
                        price: scrapedPrice,
                        external_rating: scrapedRating,
                        external_review_count: scrapedReviewCount,
                        last_scraped_at: new Date().toISOString() 
                    };

                    if (isPriceDrop) {
                        const expiryDate = new Date();
                        expiryDate.setHours(expiryDate.getHours() + 10);
                        const discountPercent = Math.round(((oldPrice - scrapedPrice) / oldPrice) * 100);
                        
                        updatePayload.is_daily_deal = true;
                        updatePayload.deal_discount_text = `${discountPercent}% OFF`;
                        updatePayload.deal_tag = 'PRICE DROP';
                        updatePayload.deal_expires_at = expiryDate.toISOString();
                    }

                    // Update Product
                    await supabaseAdmin
                        .from('products')
                        .update(updatePayload)
                        .eq('id', product.id);

                    if (scrapedPrice !== oldPrice) {
                        await supabaseAdmin
                            .from('price_history')
                            .insert([{ product_id: product.id, price: scrapedPrice }]);
                    }

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

                    return { id: product.id, title: product.title, image_url: product.image_url, old: oldPrice, new: scrapedPrice };
                }
                return null;
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter(Boolean));
            
            // Wait 2-3 seconds between batches to avoid being blocked
            if (i + batchSize < products.length) {
                await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
            }
        }

        res.json({ message: 'Sync completed', updated: results });
    } catch (err: any) {
        console.error('Sync Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getProductPriceHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('price_history')
            .select('*')
            .eq('product_id', id)
            .order('recorded_at', { ascending: true });

        if (error) {
            console.error('Price History Fetch Error:', error);
            res.json([]); // Return empty array if table not created yet
            return;
        }
        
        res.json(data || []);
    } catch (err: any) {
        res.json([]);
    }
};

export const bulkImport = async (req: Request, res: Response) => {
    try {
        const products = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of products.' });
        }

        // Clean and validate products
        const cleanedProducts = products.map(p => ({
            title: p.title,
            description: p.description,
            price: Number(p.price) || 0,
            old_price: p.old_price ? Number(p.old_price) : null,
            image_url: p.image_url,
            amazon_link: p.amazon_link || p.affiliate_link || p.affiliate_links,
            flipkart_link: p.flipkart_link,
            myntra_link: p.myntra_link,
            shopsy_link: p.shopsy_link,
            ajio_link: p.ajio_link,
            category: p.category || 'bus-booking',
            search_keywords: p.search_keywords || p.search_keyword,
            is_daily_deal: !!p.is_daily_deal,
            deal_discount_text: p.deal_discount_text,
            deal_tag: p.deal_tag,
            deal_expires_at: p.deal_expires_at
        }));

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert(cleanedProducts)
            .select();

        if (error) {
            console.error('Bulk Import Supabase Error:', error);
            throw error;
        }

        res.status(201).json({ 
            message: `${data?.length || 0} products imported successfully`, 
            count: data?.length || 0 
        });
    } catch (err: any) {
        console.error('Bulk Import Exception:', err);
        res.status(500).json({ error: err.message });
    }
};
