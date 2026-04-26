import { supabaseAdmin } from './config/supabase';

async function checkColumns() {
    const { data, error } = await supabaseAdmin
        .from('payout_requests')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching table:', error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log('Available columns in payout_requests:', Object.keys(data[0]));
    } else {
        console.log('Table is empty, cannot check columns easily.');
    }
}

checkColumns();
