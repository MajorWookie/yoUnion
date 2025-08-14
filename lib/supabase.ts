import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'


/**
 * SECURITY NOTE:
 * The anon key is safe to use in a browser context as it's designed to be public.
 * However, you should:
 * 1. Enable Row Level Security (RLS) on all tables
 * 2. Use proper RLS policies to control data access
 * 3. Never expose service keys or admin keys in client code
 * 4. For sensitive operations, use Supabase Edge Functions
 */
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  if (__DEV__) {
    console.error('Missing Supabase configuration')
  }
  throw new Error('App configuration error')
}

// Add request interceptor for monitoring
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
  global: {
    headers: {
      'X-Client-Version': Constants.expoConfig?.version || '1.0.0',
    },
  },
})
