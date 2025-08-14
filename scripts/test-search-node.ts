#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Initialize Supabase client for Node.js
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simplified search function for Node.js testing
async function searchCompanies(query: string, limit = 20) {
  try {
    // Sanitize query to prevent SQL injection
    const sanitizedQuery = query.replace(/[%_\\]/g, '\\$&')

    const { data, error } = await supabase
      .from('companies')
      .select('id, ticker, name, logo_url')
      .or(`name.ilike.%${sanitizedQuery}%, ticker.ilike.%${sanitizedQuery}%`)
      .order('name')
      .limit(limit)

    if (error) {
      throw new Error(`Search failed: ${error.message}`)
    }

    return data || []
  } catch (error) {
    throw new Error(`Search error: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Test queries
const TEST_QUERIES = [
  // Exact matches
  'Apple',
  'AAPL', 
  'Microsoft',
  'MSFT',
  'Oracle',
  'ORCL',
  
  // Partial matches
  'Corp',
  'Inc',
  'AM', // Should match Amazon (AMZN)
  
  // Case sensitivity test
  'apple',
  'APPLE',
]

async function testTextSearch() {
  console.log('🔤 Testing Company Search (Text-Only)\n')
  
  // Check environment setup
  console.log('🔍 Environment Check:')
  console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
  console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set')
  console.log('')
  
  // Test database connection
  try {
    const { data, error } = await supabase.from('companies').select('count').limit(1)
    if (error) throw error
    console.log('✅ Database connection successful\n')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return
  }
  
  let totalTests = 0
  let passedTests = 0
  
  for (const query of TEST_QUERIES) {
    totalTests++
    console.log(`Searching for: "${query}"`)
    
    try {
      const results = await searchCompanies(query, 5)
      
      if (results.length > 0) {
        console.log(`  ✅ Found ${results.length} results:`)
        results.forEach((company, index) => {
          console.log(`    ${index + 1}. ${company.ticker}: ${company.name}`)
        })
        passedTests++
      } else {
        console.log(`  ⚠️  No results found`)
      }
      
    } catch (error) {
      console.log(`  ❌ Search failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    
    console.log('') // Empty line for readability
  }
  
  console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} searches returned results`)
}

async function showDatabaseStats() {
  console.log('📊 Database Statistics:\n')
  
  try {
    // Count companies
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('ticker, name, cik')
      .order('name')
    
    if (companyError) throw companyError
    
    console.log(`Total companies: ${companyData?.length || 0}`)
    
    if (companyData && companyData.length > 0) {
      console.log('\nCompanies in database:')
      companyData.forEach((company, index) => {
        const cikStatus = company.cik?.startsWith('FALLBACK_') ? '⚠️' : '✅'
        console.log(`  ${index + 1}. ${company.ticker}: ${company.name} ${cikStatus}`)
      })
      
      // Count fallback companies
      const fallbackCount = companyData.filter(c => c.cik?.startsWith('FALLBACK_')).length
      if (fallbackCount > 0) {
        console.log(`\n⚠️  ${fallbackCount} companies have fallback data (API fetch failed)`)
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to get database stats:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const showStats = args.includes('--stats')
  
  console.log('🏢 yoUnion Company Search Tester\n')
  
  // Validate environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    console.error('Make sure these are set in .env.local:')
    console.error('  EXPO_PUBLIC_SUPABASE_URL')
    console.error('  SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  if (showStats) {
    await showDatabaseStats()
  } else {
    await testTextSearch()
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { testTextSearch, showDatabaseStats }