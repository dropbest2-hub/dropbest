-- SQL to add category column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'electronics';

-- Update existing products with some logic (optional)
UPDATE products SET category = 'electronics' WHERE category IS NULL;
