
import { scrapePrice } from './src/utils/scraper';

async function testAll() {
    const sites = [
        { name: 'Amazon', url: 'https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX2F5QT' },
        { name: 'Flipkart', url: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm50882ef91986c' },
        { name: 'Myntra', url: 'https://www.myntra.com/headphones/sony/sony-wh-1000xm5-wireless-noise-cancelling-headphones/18613478/buy' },
        { name: 'Ajio', url: 'https://www.ajio.com/samsung-galaxy-s23-5g-8-gb-128-gb-lavender/p/493666014_lavender' },
        { name: 'Shopsy', url: 'https://www.shopsy.in/apple-iphone-15-black-128-gb/p/itm50882ef91986c' }
    ];

    for (const site of sites) {
        console.log(`Testing ${site.name}...`);
        try {
            const result = await scrapePrice(site.url);
            console.log(`${site.name} Result:`, result);
        } catch (e: any) {
            console.log(`${site.name} Error:`, e.message);
        }
        console.log('-------------------');
        // Small delay between tests
        await new Promise(r => setTimeout(r, 2000));
    }
}

testAll();
