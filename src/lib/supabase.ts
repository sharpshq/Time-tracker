import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Add fallback values for development to prevent URL errors
const url = supabaseUrl === 'your-supabase-url' ? 'https://example.supabase.co' : supabaseUrl;
const key = supabaseAnonKey === 'your-supabase-anon-key' ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example' : supabaseAnonKey;

export const supabase = createClient(url, key);
