import { z } from 'zod'

export class EdgarApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message)
    this.name = 'EdgarApiError'
  }
}

// EDGAR API response schemas
const CompanyFactsSchema = z.object({
  cik: z.string(),
  entityName: z.string(),
  facts: z.object({
    'dei': z.object({
      EntityCommonStockSharesOutstanding: z.any().optional(),
      EntityPublicFloat: z.any().optional(),
      EntityCentralIndexKey: z.any().optional(),
    }).optional(),
  }).optional(),
})

const CompanyConceptSchema = z.object({
  cik: z.string(),
  taxonomy: z.string(),
  tag: z.string(),
  label: z.string(),
  description: z.string().optional(),
  entityName: z.string(),
  units: z.record(z.any()),
})

// Simplified schema for sec-api.io response
const SecApiCompanySchema = z.object({
  cik: z.union([z.string(), z.number()]).optional(),
  name: z.string(),
  ticker: z.string().optional(),
  cusip: z.string().optional(),
  exchange: z.string().optional(),
  sector: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export interface CompanyData {
  cik: string
  name: string
  ticker?: string
  description?: string
  website?: string
  sicDescription?: string
  phone?: string
  address?: string
}

class EdgarService {
  private baseUrl = 'https://api.sec-api.io'
  private userAgent = 'BetterHumanApplications-yoUnion/1.0 (https://betterhumanapplications.com)'
  private rateLimitDelay = 2000 // 2 seconds between requests (conservative)
  private lastRequestTime = 0
  private maxRetries = 3
  private backoffMultiplier = 2
  
  private getApiKey(): string {
    const apiKey = process.env.SEC_API_KEY || ''
    if (!apiKey) {
      throw new EdgarApiError('SEC_API_KEY environment variable is required')
    }
    return apiKey
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest
      console.log(`⏱️  Rate limiting: waiting ${waitTime}ms...`)
      await this.delay(waitTime)
    }
    
    this.lastRequestTime = Date.now()
  }

  private async makeRequest(url: string, retryCount = 0): Promise<any> {
    await this.rateLimit()
    
    const apiKey = this.getApiKey()
    const urlWithToken = `${url}${url.includes('?') ? '&' : '?'}token=${apiKey}`

    try {
      const response = await fetch(urlWithToken, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.userAgent,
        },
      })

      if (response.status === 429) {
        // Rate limited - implement exponential backoff
        if (retryCount < this.maxRetries) {
          const backoffDelay = this.rateLimitDelay * Math.pow(this.backoffMultiplier, retryCount)
          console.log(`⚠️  Rate limited (429). Retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`)
          await this.delay(backoffDelay)
          return this.makeRequest(url, retryCount + 1)
        } else {
          throw new EdgarApiError(
            `Rate limit exceeded after ${this.maxRetries} retries`,
            429
          )
        }
      }

      if (!response.ok) {
        throw new EdgarApiError(
          `SEC API request failed: ${response.status} ${response.statusText}`,
          response.status
        )
      }

      return response.json()
    } catch (error) {
      if (error instanceof EdgarApiError) {
        throw error
      }
      
      // Network or other errors - retry if we haven't exceeded max retries
      if (retryCount < this.maxRetries) {
        const backoffDelay = this.rateLimitDelay * Math.pow(this.backoffMultiplier, retryCount)
        console.log(`🔄 Network error. Retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`)
        await this.delay(backoffDelay)
        return this.makeRequest(url, retryCount + 1)
      }
      
      throw new EdgarApiError(
        `Request failed after ${this.maxRetries} retries: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        error
      )
    }
  }

  // Get company info by ticker using sec-api.io mapping API
  async getCompanyByTicker(ticker: string): Promise<CompanyData | null> {
    try {
      const url = `${this.baseUrl}/mapping/ticker/${ticker.toUpperCase()}`
      const data = await this.makeRequest(url)
      
      // sec-api.io returns array of company info
      if (Array.isArray(data) && data.length > 0) {
        const company = data[0] // Take first result
        
        return {
          cik: company.cik?.toString().padStart(10, '0') || '',
          name: company.name || ticker.toUpperCase(),
          ticker: ticker.toUpperCase(),
          description: company.description || `${company.name} - ${company.sector} company`,
          website: company.website,
          sicDescription: company.industry || company.sector,
          phone: company.phone,
          address: company.address,
        }
      }
      
      console.warn(`No company data found for ticker: ${ticker}, creating fallback record`)
      return {
        cik: `FALLBACK_${ticker}`,
        name: `${ticker.toUpperCase()} Corporation`,
        ticker: ticker.toUpperCase(),
        description: `${ticker.toUpperCase()} - Data not available from SEC API`,
        website: undefined,
        sicDescription: 'Not Available',
        phone: undefined,
        address: undefined,
      }
    } catch (error) {
      console.error(`Error fetching company data for ticker ${ticker}:`, error instanceof Error ? error.message : String(error))
      // Return basic fallback data
      return {
        cik: `FALLBACK_${ticker}`,
        name: `${ticker.toUpperCase()} Corporation`,
        ticker: ticker.toUpperCase(),
        description: `${ticker.toUpperCase()} - API Error: ${error instanceof Error ? error.message : String(error)}`,
        website: undefined,
        sicDescription: 'API Error',
        phone: undefined,
        address: undefined,
      }
    }
  }

  // Legacy method - now just calls getCompanyByTicker
  async getCompanySubmissions(_cik: string): Promise<CompanyData> {
    // For CIK-based lookup, we'd need a different endpoint
    // For now, throw an error as we're focusing on ticker-based lookup
    throw new EdgarApiError('CIK-based lookup not implemented yet. Use getCompanyByTicker instead.')
  }

  // Get ticker-to-CIK mapping - not needed anymore but keeping for compatibility
  async getTickerToCikMapping(): Promise<Record<string, string>> {
    console.warn('getTickerToCikMapping is deprecated, use getCompanyByTicker instead')
    return {}
  }

  // Batch fetch companies by tickers with enhanced error handling
  async getCompaniesByTickers(tickers: string[]): Promise<CompanyData[]> {
    const results: CompanyData[] = []
    const failed: string[] = []
    
    console.log(`Fetching data for ${tickers.length} companies...`)
    console.log(`Using rate limit: ${this.rateLimitDelay}ms between requests`)
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i]
      console.log(`Fetching ${i + 1}/${tickers.length}: ${ticker}`)
      
      try {
        const company = await this.getCompanyByTicker(ticker)
        if (company) {
          results.push(company)
          console.log(`  ✅ Success: ${company.name}`)
        } else {
          console.log(`  ⚠️  No data returned for ${ticker}`)
          failed.push(ticker)
        }
      } catch (error) {
        console.error(`  ❌ Failed to fetch ${ticker}:`, error instanceof Error ? error.message : String(error))
        failed.push(ticker)
        
        // If it's a rate limit error that couldn't be resolved, wait longer
        if (error instanceof EdgarApiError && error.statusCode === 429) {
          console.log(`  ⏳ Adding extra delay after rate limit error...`)
          await this.delay(5000) // 5 second pause
        }
      }
    }
    
    console.log(`\n📊 Fetch Summary:`)
    console.log(`✅ Successfully fetched: ${results.length}/${tickers.length} companies`)
    if (failed.length > 0) {
      console.log(`❌ Failed to fetch: ${failed.join(', ')}`)
    }
    
    return results
  }
}

export const edgarService = new EdgarService()