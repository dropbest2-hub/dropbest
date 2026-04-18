const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkOrdersSchema() {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching orders:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in orders table:', Object.keys(data[0]));
    } else {
        console.log('No orders found to check columns.');
    }
}

checkOrdersSchema();
