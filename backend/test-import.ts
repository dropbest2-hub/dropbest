import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_ANON_KEY!;

console.log('Testing with URL:', url);

const supabase = createClient(url, key);

async function run() {
    console.log('Fetching products...');
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success:', data);
    }
}

run();
