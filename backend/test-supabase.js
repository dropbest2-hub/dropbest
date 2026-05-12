
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log('Public Client (Anon): Connection Successful, user count fetched.');
    } catch (err) {
        console.error('Public Client Failed:', err.message);
    }

    try {
        const { data, error } = await supabaseAdmin.from('users').select('*').limit(1);
        if (error) throw error;
        console.log('Admin Client (Service): Connection Successful, user found:', data[0]?.email);
    } catch (err) {
        console.error('Admin Client Failed:', err.message);
    }
}

test();
