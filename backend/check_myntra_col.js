const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkProductsSchema() {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching products:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in products table:', Object.keys(data[0]));
        if (Object.keys(data[0]).includes('myntra_link')) {
            console.log('SUCCESS: myntra_link exists!');
        } else {
            console.log('FAILURE: myntra_link MISSING!');
        }
    } else {
        console.log('No products found to check columns.');
    }
}

checkProductsSchema();
