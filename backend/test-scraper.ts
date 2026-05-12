
import { scrapePrice } from './src/utils/scraper';

async function testScraper() {
    const amazonUrl = 'https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX2F5QT';
    const flipkartUrl = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm50882ef91986c';

    console.log('Testing Amazon Scraper...');
    const amazonResult = await scrapePrice(amazonUrl);
    console.log('Amazon Result:', amazonResult);

    console.log('\nTesting Flipkart Scraper...');
    const flipkartResult = await scrapePrice(flipkartUrl);
    console.log('Flipkart Result:', flipkartResult);
}

testScraper();
