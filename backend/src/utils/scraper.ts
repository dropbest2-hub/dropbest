import axios from 'axios';
import * as cheerio from 'cheerio';
import axiosRetry from 'axios-retry';

// Configure axios to retry on failure
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
];

interface ScrapeResult {
    price: number | null;
    rating: number | null;
    reviewCount: string | null;
    success: boolean;
    error?: string;
}

const extractJsonLd = ($: cheerio.CheerioAPI) => {
    const scripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
        try {
            const content = $(scripts[i]).text();
            const data = JSON.parse(content);
            const products = Array.isArray(data) ? data : [data];
            for (const p of products) {
                // Some sites use @type: "Product", others might have an array
                const type = p['@type'];
                if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
                    return p;
                }
            }
        } catch (e) {}
    }
    return null;
};

export const scrapePrice = async (url: string): Promise<ScrapeResult> => {
    try {
        const isAmazon = url.includes('amazon.in') || url.includes('amzn.to');
        const isFlipkart = url.includes('flipkart.com');
        const isMyntra = url.includes('myntra.com');
        const isAjio = url.includes('ajio.com');
        const isShopsy = url.includes('shopsy.in');

        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        // Enhanced headers to look like a real browser
        const headers: any = {
            'User-Agent': userAgent,
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Referer': 'https://www.google.com/',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Upgrade-Insecure-Requests': '1',
        };

        // Site specific header tweaks
        if (isFlipkart || isShopsy) {
            headers['X-Requested-With'] = 'XMLHttpRequest'; // Sometimes helps with Flipkart
        }

        const { data } = await axios.get(url, {
            headers,
            timeout: 20000,
            validateStatus: (status) => status < 500 // Accept 403 etc to handle gracefully
        });

        const $ = cheerio.load(data);
        const jsonLd = extractJsonLd($);

        let price: number | null = null;
        let rating: number | null = null;
        let reviewCount: string | null = null;

        // Try JSON-LD first as it's more stable
        if (jsonLd) {
            const offers = jsonLd.offers;
            if (offers) {
                const priceValue = Array.isArray(offers) ? (offers[0].price || offers[0].lowPrice) : (offers.price || offers.lowPrice);
                if (priceValue) price = parseFloat(priceValue.toString().replace(/[^\d.]/g, ''));
            }
            if (jsonLd.aggregateRating) {
                rating = parseFloat(jsonLd.aggregateRating.ratingValue);
                reviewCount = jsonLd.aggregateRating.reviewCount?.toString() || jsonLd.aggregateRating.ratingCount?.toString();
            }
        }

        // Fallback to selectors if JSON-LD failed or partially failed
        if (price === null) {
            let priceStr = '';
            if (isAmazon) {
                priceStr = $('.a-price-whole').first().text() || $('.a-offscreen').first().text();
            } else if (isFlipkart || isShopsy) {
                priceStr = $('.Nx9bqj').first().text() || $('._30jeq3').first().text() || $('.price-info .price').text() || $('.hl05eU ._30jeq3').first().text();
            } else if (isMyntra) {
                priceStr = $('.pdp-price strong').first().text() || $('.product-discountedPrice').first().text() || $('.pdp-mrp').first().text();
            } else if (isAjio) {
                priceStr = $('.prod-sp').first().text() || $('.price').first().text() || $('.pdp-price-info').text();
            }

            if (priceStr) {
                price = parseFloat(priceStr.replace(/[^\d.]/g, ''));
            }
        }

        // Regex fallback for price if everything else fails
        if (price === null || isNaN(price)) {
            const priceMatches = data.match(/₹\s?([\d,]{2,10})/g);
            if (priceMatches && priceMatches.length > 0) {
                // Usually the first or second large price is the actual price
                for (const m of priceMatches) {
                    const p = parseFloat(m.replace(/[^\d]/g, ''));
                    if (p > 10) { // Ignore very small numbers
                        price = p;
                        break;
                    }
                }
            }
        }

        // Special case for Myntra state object if DOM/JSON-LD fails
        if (price === null && isMyntra) {
            const scripts = $('script');
            for (let i = 0; i < scripts.length; i++) {
                const text = $(scripts[i]).text();
                if (text.includes('window.__myx')) {
                    const match = text.match(/window\.__myx\s*=\s*({.*?});/);
                    if (match) {
                        try {
                            const state = JSON.parse(match[1]);
                            const pdpData = state.pdpData;
                            if (pdpData && pdpData.price) {
                                price = pdpData.price.discounted || pdpData.price.mrp;
                            }
                        } catch (e) {}
                    }
                }
            }
        }

        if (rating === null) {
            if (isAmazon) {
                const ratingStr = $('span.a-icon-alt').first().text();
                const match = ratingStr.match(/(\d+(\.\d+)?)/);
                if (match) rating = parseFloat(match[0]);
            } else if (isFlipkart || isShopsy) {
                rating = parseFloat($('[class*="_3LWZlK"]').first().text()) || parseFloat($('._3LWZlK').first().text());
            } else if (isMyntra) {
                rating = parseFloat($('.index-overallRating').first().text()) || parseFloat($('.index-averageRating').first().text());
            } else if (isAjio) {
                rating = parseFloat($('.rating-stars').first().text()) || parseFloat($('.avg-rating-count').first().text());
            }
        }

        if (reviewCount === null) {
            if (isAmazon) {
                reviewCount = $('#acrCustomerReviewText').first().text().replace(/[^\d]/g, '');
            } else if (isFlipkart || isShopsy) {
                reviewCount = $('._2_R_oD').first().text() || $('[class*="W_R_oD"]').first().text() || $('span._2BWvWn').first().text();
            } else if (isMyntra) {
                reviewCount = $('.index-ratingsCount').first().text().replace(/[^\d]/g, '');
            } else if (isAjio) {
                reviewCount = $('.rating-count').first().text().replace(/[^\d]/g, '');
            }
        }

        return { 
            price: price && !isNaN(price) ? price : null,
            rating: rating && !isNaN(rating) ? rating : null,
            reviewCount: reviewCount || null,
            success: price !== null && !isNaN(price)
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
