import axios from 'axios';
import * as cheerio from 'cheerio';
import axiosRetry from 'axios-retry';
import { URL } from 'url';

// Configure axios to retry on failure
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const USER_AGENTS = {
    mobileSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
    chromeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const RANDOM_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
];

interface ScrapeResult {
    price: number | null;
    rating: number | null;
    reviewCount: string | null;
    success: boolean;
    error?: string;
}

/**
 * Resolves short URLs (like fktr.in, amzn.to) and extracts target product URLs
 * from affiliate redirection pages (like linkredirect.in).
 */
export const resolveUrl = async (url: string): Promise<string> => {
    try {
        // Quick check if input URL already has dl param
        try {
            const urlObj = new URL(url);
            const dl = urlObj.searchParams.get('dl');
            if (dl) {
                return decodeURIComponent(dl);
            }
        } catch (e) {}

        const isShortOrRedirect = url.includes('fktr.in') || url.includes('amzn.to') || url.includes('linkredirect.in');
        if (!isShortOrRedirect) {
            return url;
        }

        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENTS.chromeWindows },
            maxRedirects: 5,
            timeout: 10000,
            validateStatus: () => true
        });

        const finalUrl = response.request?.res?.responseUrl || url;
        
        // If redirected to linkredirect.in (EarnKaro/Affiliate gate), extract the 'dl' parameter
        if (finalUrl.includes('linkredirect.in')) {
            try {
                const urlObj = new URL(finalUrl);
                const dl = urlObj.searchParams.get('dl');
                if (dl) {
                    return decodeURIComponent(dl);
                }
            } catch (e) {}

            // Fallback: extract from script tags in HTML
            const html = response.data || '';
            const match = html.match(/var cashbackUrl = "(.*?)";/);
            if (match && match[1]) {
                return match[1];
            }
        }

        return finalUrl;
    } catch (err: any) {
        console.error(`Error resolving URL ${url}:`, err.message);
        return url;
    }
};

const extractJsonLd = ($: cheerio.CheerioAPI) => {
    const scripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
        try {
            const content = $(scripts[i]).text();
            const data = JSON.parse(content);
            const products = Array.isArray(data) ? data : [data];
            for (const p of products) {
                const type = p['@type']?.toString().toLowerCase() || '';
                // Matches Product, ProductGroup, etc.
                if (type.includes('product')) {
                    return p;
                }
            }
        } catch (e) {}
    }
    return null;
};

export const scrapePrice = async (rawUrl: string): Promise<ScrapeResult> => {
    try {
        const url = await resolveUrl(rawUrl);
        const isAmazon = url.includes('amazon.in') || url.includes('amzn.to');
        const isFlipkart = url.includes('flipkart.com');
        const isMyntra = url.includes('myntra.com');
        const isAjio = url.includes('ajio.com');
        const isShopsy = url.includes('shopsy.in');

        // Use Mobile Safari for Ajio, Flipkart, and Shopsy to bypass Akamai/reCAPTCHA blocking
        const useMobile = isAjio || isFlipkart || isShopsy;
        const userAgent = useMobile ? USER_AGENTS.mobileSafari : RANDOM_AGENTS[Math.floor(Math.random() * RANDOM_AGENTS.length)];

        // Enhanced headers
        const headers: any = {
            'User-Agent': userAgent,
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        };

        if (isFlipkart || isShopsy) {
            headers['Referer'] = 'https://linkredirect.in/';
        } else {
            headers['Referer'] = 'https://www.google.com/';
        }

        const { data, status } = await axios.get(url, {
            headers,
            timeout: 20000,
            validateStatus: (s) => s < 500
        });

        if (status !== 200) {
            return { price: null, rating: null, reviewCount: null, success: false, error: `HTTP status ${status}` };
        }

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
            const aggRating = jsonLd.aggregateRating || jsonLd.AggregateRating;
            if (aggRating) {
                rating = parseFloat(aggRating.ratingValue);
                reviewCount = aggRating.reviewCount?.toString() || aggRating.ratingCount?.toString();
            }
        }

        // Fallback to selectors if JSON-LD failed or partially failed
        if (price === null || isNaN(price)) {
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
