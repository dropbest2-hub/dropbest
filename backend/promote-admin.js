const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
    console.error('Missing URL or Service Key in .env');
    process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function promoteAdmin() {
    const targetEmail = 'dropbest2@gmail.com';
    console.log(`Searching for user: ${targetEmail}...`);

    // We can't easily query auth.users from common client, but we can query public.users
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', targetEmail)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log('User profile not found in public.users table.');
            console.log('Please SIGN IN to the app once with this account to trigger profile creation.');
        } else {
            console.error('Error fetching user:', error);
        }
        return;
    }

    console.log('User found! Current role:', user.role);

    if (user.role === 'ADMIN') {
        console.log('User is already an ADMIN.');
        return;
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('id', user.id);

    if (updateError) {
        console.error('Failed to promote user:', updateError);
    } else {
        console.log(`SUCCESS! ${targetEmail} is now an ADMIN.`);
    }
}

promoteAdmin();
