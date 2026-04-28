-- Migration: Rename shopify_link to shopsy_link
ALTER TABLE public.products RENAME COLUMN shopify_link TO shopsy_link;
