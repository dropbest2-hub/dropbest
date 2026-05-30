const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function cleanEmptyProducts() {
    console.log('Cleaning empty products...');
    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .delete()
            .is('title', null);
            
        if (error) throw error;
        console.log('Deleted successfully. Now checking empty strings...');
        
        const { data: data2, error: error2 } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('title', '');
            
        if (error2) throw error2;
        console.log('Empty strings deleted successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

cleanEmptyProducts();
