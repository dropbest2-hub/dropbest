const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
        console.error('Error fetching products:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('No data found in products table to check columns.');
    }
}

checkSchema();
