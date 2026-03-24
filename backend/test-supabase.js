const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hiutepcjueudehhufroi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdXRlcGNqdWV1ZGVoaHVmcm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTk0ODQsImV4cCI6MjA4ODc3NTQ4NH0.XM1yRtfAX9WA53S6zFTjxVoku8HRrmSM8GLwYHlfi7s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('products').select('*').limit(1);
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success! Connection established. Data:', data);
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

test();
