#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { edgarService, type CompanyData } from '@/lib/services/edgar'
import { embeddingService, createCompanyEmbeddingText } from '@/lib/services/embedding'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Debug environment variables
console.log('🔍 Environment variables check:')
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set')
console.log('SEC_API_KEY:', process.env.SEC_API_KEY ? 'Set' : 'Not set')
console.log('')

// Company list from user requirements
const SEED_COMPANIES = [
  'ORCL',    // Oracle
  'WMT',     // Walmart Inc.
  'AMZN',    // Amazon
  'AAPL',    // Apple Inc.
  'MSFT',    // Microsoft
  'GOOGL',   // Alphabet Inc.
  'BRK.A',   // Berkshire Hathaway (Class A)
  'NVDA',    // NVIDIA
  'META',    // Meta Platforms
  'TSLA',    // Tesla Inc.
  'JPM',     // JPMorgan Chase
  'JNJ',     // Johnson & Johnson
  'ACN',     // Accenture plc
  'FDX',     // FedEx Corp
  'HD',      // Home Depot
  'UNH',     // UnitedHealth Group Inc.
  'TGT',     // Target Corp
  'NFLX',    // Netflix
  'CRM',     // Salesforce, Inc.
  'CMG',     // Chipotle
]

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SeedOptions {
  skipEmbeddings?: boolean
  forceUpdate?: boolean
}

class CompanySeeder {
  async checkPrerequisites(): Promise<void> {
    // Check Supabase connection
    const { error } = await supabase.from('companies').select('count').limit(1)
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`)
    }
    
    console.log('✅ Supabase connection verified')
    
    // Check Ollama health (only if not skipping embeddings)
    const isOllamaHealthy = await embeddingService.checkHealth()
    if (!isOllamaHealthy) {
      console.warn('⚠️  Ollama not available - embeddings will be skipped')
      console.warn('   Make sure Ollama is running and nomic-embed-text model is installed')
      console.warn('   Run: ollama pull nomic-embed-text')
    } else {
      console.log('✅ Ollama embedding service verified')
    }
  }

  async seedCompanyData(options: SeedOptions = {}): Promise<void> {
    console.log(`\n🚀 Starting company data seeding for ${SEED_COMPANIES.length} companies...`)
    
    // Step 1: Fetch data from EDGAR
    console.log('\n📊 Step 1: Fetching company data from EDGAR API...')
    const companyData = await edgarService.getCompaniesByTickers(SEED_COMPANIES)
    
    if (companyData.length === 0) {
      throw new Error('No company data fetched from EDGAR')
    }
    
    console.log(`✅ Fetched data for ${companyData.length} companies`)
    
    // Step 2: Insert/update companies in database
    console.log('\n💾 Step 2: Inserting companies into database...')
    const insertedCompanies = await this.insertCompanies(companyData, options.forceUpdate)
    
    // Step 3: Generate and store embeddings (if not skipped)
    if (!options.skipEmbeddings) {
      console.log('\n🧠 Step 3: Generating embeddings...')
      await this.generateEmbeddings(insertedCompanies)
    } else {
      console.log('\n⏭️  Step 3: Skipping embeddings (as requested)')
    }
    
    console.log('\n🎉 Company seeding completed successfully!')
  }

  private async insertCompanies(companyData: CompanyData[], forceUpdate = false): Promise<any[]> {
    const insertedCompanies = []
    
    for (let i = 0; i < companyData.length; i++) {
      const company = companyData[i]
      console.log(`Inserting ${i + 1}/${companyData.length}: ${company.name} (${company.ticker})`)
      
      try {
        // Check if company already exists
        const { data: existing } = await supabase
          .from('companies')
          .select('id, ticker, name')
          .eq('ticker', company.ticker!)
          .single()
        
        let result
        
        if (existing && !forceUpdate) {
          console.log(`  ⏭️  Company ${company.ticker} already exists, skipping...`)
          result = { data: existing }
        } else {
          const companyRecord = {
            ticker: company.ticker!,
            cik: company.cik.padStart(10, '0'),
            name: company.name,
            ceo_name: null, // We'll populate this later from filings
            logo_url: null, // We'll populate this later or from external service
          }
          
          if (existing && forceUpdate) {
            console.log(`  🔄 Updating existing company ${company.ticker}...`)
            result = await supabase
              .from('companies')
              .update(companyRecord)
              .eq('id', existing.id)
              .select()
              .single()
          } else {
            console.log(`  ➕ Inserting new company ${company.ticker}...`)
            result = await supabase
              .from('companies')
              .insert(companyRecord)
              .select()
              .single()
          }
        }
        
        if (result.error) {
          console.error(`  ❌ Failed to insert ${company.ticker}:`, result.error.message)
          continue
        }
        
        insertedCompanies.push({
          ...result.data,
          originalData: company, // Keep original EDGAR data for embedding
        })
        
      } catch (error) {
        console.error(`  ❌ Error processing ${company.ticker}:`, error)
        continue
      }
    }
    
    console.log(`✅ Successfully processed ${insertedCompanies.length} companies`)
    return insertedCompanies
  }

  private async generateEmbeddings(companies: any[]): Promise<void> {
    if (companies.length === 0) {
      console.log('No companies to generate embeddings for')
      return
    }
    
    // Check Ollama health again
    const isHealthy = await embeddingService.checkHealth()
    if (!isHealthy) {
      console.warn('⚠️  Skipping embeddings - Ollama not available')
      return
    }
    
    console.log(`Generating embeddings for ${companies.length} companies...`)
    
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i]
      const originalData = company.originalData
      
      console.log(`Generating embedding ${i + 1}/${companies.length}: ${company.name}`)
      
      try {
        // Create embedding text from company data
        const embeddingText = createCompanyEmbeddingText({
          name: originalData.name,
          ticker: originalData.ticker,
          description: originalData.description,
          sicDescription: originalData.sicDescription,
          website: originalData.website,
        })
        
        console.log(`  📝 Embedding text: ${embeddingText.substring(0, 100)}...`)
        
        // Generate embedding
        const embedding = await embeddingService.generateEmbedding(embeddingText)
        
        // Store in database
        const { error } = await supabase
          .from('embeddings')
          .insert({
            company_id: company.id,
            filing_id: null, // This is company-level embedding, not filing-specific
            source: 'company_overview',
            chunk_index: 0,
            content: embeddingText,
            embedding: `[${embedding.join(',')}]`, // Store as string representation
            metadata: {
              ticker: company.ticker,
              generated_at: new Date().toISOString(),
              model: 'nomic-embed-text',
              source_data: {
                name: originalData.name,
                ticker: originalData.ticker,
                cik: originalData.cik,
                has_description: !!originalData.description,
                has_sic_description: !!originalData.sicDescription,
              }
            }
          })
        
        if (error) {
          console.error(`  ❌ Failed to store embedding for ${company.ticker}:`, error.message)
          continue
        }
        
        console.log(`  ✅ Embedding stored successfully`)
        
      } catch (error) {
        console.error(`  ❌ Failed to generate embedding for ${company.ticker}:`, error)
        continue
      }
    }
    
    console.log('✅ Embedding generation completed')
  }

  async showStats(): Promise<void> {
    console.log('\n📊 Database Statistics:')
    
    const { data: companyCount } = await supabase
      .from('companies')
      .select('count')
      .single()
    
    const { data: embeddingCount } = await supabase
      .from('embeddings')
      .select('count')
      .eq('source', 'company_overview')
      .single()
    
    console.log(`Companies: ${companyCount?.count || 0}`)
    console.log(`Company embeddings: ${embeddingCount?.count || 0}`)
    
    // Show sample companies
    const { data: sampleCompanies } = await supabase
      .from('companies')
      .select('ticker, name')
      .limit(5)
    
    if (sampleCompanies && sampleCompanies.length > 0) {
      console.log('\nSample companies:')
      sampleCompanies.forEach(company => {
        console.log(`  • ${company.ticker}: ${company.name}`)
      })
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const skipEmbeddings = args.includes('--skip-embeddings')
  const forceUpdate = args.includes('--force-update')
  const showStatsOnly = args.includes('--stats')
  
  console.log('🏢 yoUnion Company Data Seeder')
  
  // Validate environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL')
    console.error('   SUPABASE_SERVICE_ROLE_KEY')
    console.error('')
    console.error('Add these to your .env.local file:')
    console.error('   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url')
    console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
    process.exit(1)
  }
  
  const seeder = new CompanySeeder()
  
  try {
    if (showStatsOnly) {
      await seeder.showStats()
      return
    }
    
    await seeder.checkPrerequisites()
    
    console.log(`\nOptions:`)
    console.log(`  Skip embeddings: ${skipEmbeddings ? 'Yes' : 'No'}`)
    console.log(`  Force update: ${forceUpdate ? 'Yes' : 'No'}`)
    
    await seeder.seedCompanyData({
      skipEmbeddings,
      forceUpdate,
    })
    
    await seeder.showStats()
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { CompanySeeder, SEED_COMPANIES }