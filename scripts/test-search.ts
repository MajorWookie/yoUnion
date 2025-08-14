#!/usr/bin/env tsx
import { searchCompanies, getErrorMessage } from '@/lib/api/companies'

// Test queries to validate search functionality
const TEST_QUERIES = [
  // Exact matches
  'Apple',
  'AAPL', 
  'Microsoft',
  'MSFT',
  
  // Partial matches
  'Tech',
  'Bank',
  'Retail',
  
  // Semantic searches (should work after embeddings)
  'artificial intelligence company',
  'cloud computing services',
  'electric vehicle manufacturer',
  'streaming entertainment',
  'social media platform',
  'e-commerce marketplace',
]

async function testSearch() {
  console.log('🔍 Testing Company Search Functionality\n')
  
  for (const query of TEST_QUERIES) {
    console.log(`Searching for: "${query}"`)
    
    try {
      // Test both semantic and text search
      const results = await searchCompanies(query, 5)
      
      if (results.length > 0) {
        console.log(`  ✅ Found ${results.length} results:`)
        results.forEach((company, index) => {
          console.log(`    ${index + 1}. ${company.ticker}: ${company.name}`)
        })
      } else {
        console.log(`  ❌ No results found`)
      }
      
    } catch (error) {
      console.log(`  ❌ Search failed: ${getErrorMessage(error)}`)
    }
    
    console.log('') // Empty line for readability
  }
}

// Also test text-only search
async function testTextSearchOnly() {
  console.log('🔤 Testing Text-Only Search (no semantic search)\n')
  
  const textQueries = ['Apple', 'Tech', 'artificial intelligence']
  
  for (const query of textQueries) {
    console.log(`Text search for: "${query}"`)
    
    try {
      const results = await searchCompanies(query, 5, false) // Disable semantic search
      
      if (results.length > 0) {
        console.log(`  ✅ Found ${results.length} results:`)
        results.forEach((company, index) => {
          console.log(`    ${index + 1}. ${company.ticker}: ${company.name}`)
        })
      } else {
        console.log(`  ❌ No results found`)
      }
      
    } catch (error) {
      console.log(`  ❌ Search failed: ${getErrorMessage(error)}`)
    }
    
    console.log('')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const textOnly = args.includes('--text-only')
  
  if (textOnly) {
    await testTextSearchOnly()
  } else {
    await testSearch()
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { testSearch, testTextSearchOnly }