const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing with Env:', { url: supabaseUrl, key: supabaseKey ? 'PRESENT' : 'MISSING' });

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        const { data, error } = await supabase.from('products').select('*').limit(1);
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success! Data:', data);
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

test();
