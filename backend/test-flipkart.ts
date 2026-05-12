
import axios from 'axios';

async function testFlipkart() {
    const flipkartUrl = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm50882ef91986c';
    
    try {
        console.log('Testing Flipkart with more headers...');
        const { data } = await axios.get(flipkartUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Device-Memory': '8',
                'Service-Worker-Navigation-Preload': 'true',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.google.com/',
            }
        });
        console.log('Success! Data length:', data.length);
        console.log('Snippet:', data.substring(0, 500));
    } catch (error: any) {
        console.log('Failed again:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
        }
    }
}

testFlipkart();
