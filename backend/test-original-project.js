const { createClient } = require('@supabase/supabase-js');

const url = 'https://hiutepcjueudehhufroi.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdXRlcGNqdWV1ZGVoaHVmcm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTk0ODQsImV4cCI6MjA4ODc3NTQ4NH0.XM1yRtfAX9WA53S6zFTjxVoku8HRrmSM8GLwYHlfi7s';

const supabase = createClient(url, key);

async function test() {
    console.log('Testing connection to ORIGINAL project...');
    try {
        const { data, error } = await supabase.from('products').select('*').limit(1);
        if (error) {
            console.error('Connection Failed:', error);
        } else {
            console.log('Connection Success! Data:', data);
        }
    } catch (err) {
        console.error('Fetch Failed:', err.message);
    }
}

test();
