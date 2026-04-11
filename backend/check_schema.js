const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkSchema() {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching users:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in users table:', Object.keys(data[0]));
    } else {
        console.log('No users found to check columns.');
    }
}

checkSchema();
