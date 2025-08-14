import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Database } from '@/types/database'

/**
 * Enhanced Supabase client with security and monitoring
 * SECURITY NOTE:
 * The anon key is safe to use in a browser context as it's designed to be public.
 * However, you should:
 * 1. Enable Row Level Security (RLS) on all tables
 * 2. Use proper RLS policies to control data access
 * 3. Never expose service keys or admin keys in client code
 * 4. For sensitive operations, use Supabase Edge Functions
 */

// Validate environment variables at build time
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  if (__DEV__) {
    console.error('Missing Supabase configuration. Please check your environment variables.')
  }
  throw new Error('App configuration error: Missing required environment variables')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
    storageKey: 'younion-auth',
    flowType: 'pkce', // More secure for mobile apps
  },
  global: {
    headers: {
      'X-Client-Version': Constants.expoConfig?.version || '1.0.0',
      'X-Client-Platform': Platform.OS,
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Add request interceptor for monitoring (optional, for debugging)
if (__DEV__) {
  const originalFrom = supabase.from.bind(supabase)
  supabase.from = (table: string) => {
    console.log(`[Supabase] Accessing table: ${table}`)
    return originalFrom(table)
  }
}

// Helper to check if RLS is enabled (use in development)
export async function checkRLSEnabled(tableName: string): Promise<boolean> {
  if (!__DEV__) return true // Only check in development

  try {
    const { data, error } = await supabase
      .rpc('check_rls_enabled', { table_name: tableName })

    if (error) {
      console.warn(`Could not check RLS for ${tableName}:`, error)
      return false
    }

    return data === true
  } catch (error) {
    console.warn(`RLS check failed for ${tableName}:`, error)
    return false
  }
}

// Export a function to verify critical tables have RLS
export async function verifySecurity() {
  if (!__DEV__) return

  const criticalTables = ['profiles', 'audit_log']
  const results = await Promise.all(
    criticalTables.map(async (table) => ({
      table,
      secure: await checkRLSEnabled(table),
    }))
  )

  const insecureTables = results.filter(r => !r.secure)
  if (insecureTables.length > 0) {
    console.error('⚠️ SECURITY WARNING: The following tables do not have RLS enabled:',
      insecureTables.map(t => t.table).join(', '))
  }
}

import { Platform } from 'react-native'