const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkProductSchema() {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching products:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in products table:', Object.keys(data[0]));
    } else {
        console.log('No products found to check columns.');
    }
}

checkProductSchema();
