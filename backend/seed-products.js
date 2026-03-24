const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hiutepcjueudehhufroi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdXRlcGNqdWV1ZGVoaHVmcm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTk0ODQsImV4cCI6MjA4ODc3NTQ4NH0.XM1yRtfAX9WA53S6zFTjxVoku8HRrmSM8GLwYHlfi7s';

const supabase = createClient(supabaseUrl, supabaseKey);

const initialProducts = [
    // Mock data removed as manual addition is working.
];

async function seed() {
    console.log('Seeding initial products...');
    try {
        const { data, error } = await supabase.from('products').insert(initialProducts).select();
        if (error) {
            console.error('Seeding Error:', error);
        } else {
            console.log('Success! Seeded', data?.length || 0, 'products.');
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

seed();
