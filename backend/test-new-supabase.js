const { createClient } = require('@supabase/supabase-js');
const url = 'https://sfpyykfxwvjogxzjmute.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcHl5a2Z4d3Zqb2d4emptdXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTIwMzAsImV4cCI6MjA4ODcyODAzMH0.Eh1kJ3zeP79DSjzyXU7l9aVMhGba7ROqm7qjFqzyC44';
const supabase = createClient(url, key);
supabase.from('products').select('*').limit(1).then(({data, error}) => {
    if (error) console.error(error);
    else console.log('Success!', data);
});
