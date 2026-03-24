const https = require('https');

const url = 'https://hiutepcjueudehhufroi.supabase.co';

console.log(`Checking reachability of ${url}...`);

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', (d) => {
    // console.log(d.toString());
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
