import { createBrowserClient } from "@supabase/ssr";
import { Database } from '../../../database.types';

// Environment variables are injected at build time by Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const createClient = () =>
  createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );