import axios from 'axios';
import * as cheerio from 'cheerio';
import axiosRetry from 'axios-retry';

// Configure axios to retry on failure
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

interface ScrapeResult {
    price: number | null;
    rating: number | null;
    reviewCount: string | null;
    success: boolean;
    error?: string;
}

export const scrapePrice = async (url: string): Promise<ScrapeResult> => {
    try {
        const isAmazon = url.includes('amazon.in') || url.includes('amzn.to');
        const isFlipkart = url.includes('flipkart.com');

        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        let priceStr = '';
        let ratingStr = '';
        let reviewCountStr = '';

        if (isAmazon) {
            // Amazon Selectors
            priceStr = $('.a-price-whole').first().text() || 
                       $('.a-offscreen').first().text() || 
                       $('#priceblock_ourprice').text() ||
                       $('#priceblock_dealprice').text();
            
            ratingStr = $('span.a-icon-alt').first().text(); // "4.5 out of 5 stars"
            reviewCountStr = $('#acrCustomerReviewText').first().text(); // "12,345 ratings"

        } else if (isFlipkart) {
            // Flipkart Selectors
            priceStr = $('.Nx9bqj').first().text() || 
                       $('._30jeq3').first().text() || 
                       $('.price-info .price').text();

            ratingStr = $('div._3LWZlK').first().text() || $('div.X_R_oD').first().text(); // "4.5"
            reviewCountStr = $('span._2_R_oD').first().text() || $('span.W_R_oD').first().text(); // "1,234 ratings"
        }

        if (!priceStr) return { price: null, rating: null, reviewCount: null, success: false, error: 'Price selector not found' };

        // Clean values
        const cleanPrice = parseFloat(priceStr.replace(/[^\d.]/g, ''));
        
        let cleanRating = null;
        if (ratingStr) {
            const match = ratingStr.match(/(\d+(\.\d+)?)/);
            if (match) cleanRating = parseFloat(match[0]);
        }

        const cleanReviewCount = reviewCountStr ? reviewCountStr.replace('ratings', '').replace('rating', '').trim() : null;
        
        return { 
            price: isNaN(cleanPrice) ? null : cleanPrice,
            rating: cleanRating,
            reviewCount: cleanReviewCount,
            success: !isNaN(cleanPrice) 
        };

    } catch (error: any) {
        return { 
            price: null, 
            rating: null,
            reviewCount: null,
            success: false, 
            error: error.message 
        };
    }
};
