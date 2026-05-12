import fs from 'fs';
import path from 'path';

const filePath = 'd:/dropbest/frontend/src/app/admin/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `  const handleDeleteBusRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        fetchData();
    } catch (err: any) {
        alert('Error deleting route: ' + err.message);
    }
  };`;

const newCode = `  const handleDeleteBusRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
        await axios.delete(
            \`\${API_URL}/products/\${id}\`,
            { headers: { Authorization: \`Bearer \${session?.access_token}\` } }
        );
        setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
        alert('Error deleting route: ' + (err.response?.data?.error || err.message));
    }
  };`;

// Use a more flexible replace if exact match fails
if (content.includes('supabase.from(\'products\').delete().eq(\'id\', id)')) {
    content = content.replace(
        /const\s+\{\s*error\s*\}\s*=\s*await\s+supabase\.from\('products'\)\.delete\(\)\.eq\('id',\s*id\);[\s\S]*?fetchData\(\);/g,
        `await axios.delete(\`\${API_URL}/products/\${id}\`, { headers: { Authorization: \`Bearer \${session?.access_token}\` } });\n        setProducts(prev => prev.filter(p => p.id !== id));`
    );
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated the file!');
} else {
    console.log('Could not find the target code block.');
}
