import dotenv from 'dotenv';
dotenv.config();

/**
 * Environment variable validation and access.
 * This ensures that the app fails early if crucial production variables are missing.
 */

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
];

if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('FRONTEND_URL');
}

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '8000',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-for-dev-only',
  FRONTEND_URL: process.env.FRONTEND_URL || '*',
};
