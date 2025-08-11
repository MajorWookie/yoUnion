import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * SECURITY NOTE:
 * The anon key is safe to use in a browser context as it's designed to be public.
 * However, you should:
 * 1. Enable Row Level Security (RLS) on all tables
 * 2. Use proper RLS policies to control data access
 * 3. Never expose service keys or admin keys in client code
 * 4. For sensitive operations, use Supabase Edge Functions
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})