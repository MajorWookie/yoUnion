import { z } from 'zod'

export class EmbeddingError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'EmbeddingError'
  }
}

// Ollama API response schema
const OllamaEmbedResponseSchema = z.object({
  embedding: z.array(z.number()),
})

interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>
}

class OllamaEmbeddingService implements EmbeddingService {
  private baseUrl: string
  private model: string
  private maxRetries: number
  private retryDelay: number

  constructor(
    baseUrl = 'http://localhost:11434',
    model = 'nomic-embed-text',
    maxRetries = 3,
    retryDelay = 1000
  ) {
    this.baseUrl = baseUrl
    this.model = model
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest(text: string): Promise<number[]> {
    const url = `${this.baseUrl}/api/embeddings`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: text,
      }),
    })

    if (!response.ok) {
      throw new EmbeddingError(
        `Ollama API request failed: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    const parsed = OllamaEmbedResponseSchema.parse(data)
    
    return parsed.embedding
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new EmbeddingError('Text cannot be empty')
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.makeRequest(text.trim())
      } catch (error) {
        lastError = error as Error
        console.warn(`Embedding attempt ${attempt}/${this.maxRetries} failed:`, error)
        
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt)
        }
      }
    }

    throw new EmbeddingError(
      `Failed to generate embedding after ${this.maxRetries} attempts`,
      lastError
    )
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = []
    
    console.log(`Generating embeddings for ${texts.length} texts...`)
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i]
      console.log(`Generating embedding ${i + 1}/${texts.length}`)
      
      try {
        const embedding = await this.generateEmbedding(text)
        embeddings.push(embedding)
        
        // Small delay between requests to be nice to Ollama
        if (i < texts.length - 1) {
          await this.delay(100)
        }
      } catch (error) {
        console.error(`Failed to generate embedding for text ${i + 1}:`, error)
        // You could either throw here or push an empty array/null
        throw error
      }
    }
    
    console.log(`Successfully generated ${embeddings.length} embeddings`)
    return embeddings
  }

  // Helper method to check if Ollama is running and model is available
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) return false
      
      const data = await response.json()
      const models = data.models || []
      
      return models.some((model: any) => model.name?.includes(this.model))
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const embeddingService = new OllamaEmbeddingService()

// Helper function to create company embedding text from company data
export function createCompanyEmbeddingText(company: {
  name: string
  ticker?: string
  description?: string
  sicDescription?: string
  website?: string
}): string {
  const parts = []
  
  // Company name and ticker
  parts.push(company.name)
  if (company.ticker) {
    parts.push(`(${company.ticker})`)
  }
  
  // Business description
  if (company.description) {
    parts.push(company.description)
  }
  
  // Industry description
  if (company.sicDescription && company.sicDescription !== company.description) {
    parts.push(`Industry: ${company.sicDescription}`)
  }
  
  // Website (adds context about company)
  if (company.website) {
    parts.push(`Website: ${company.website}`)
  }
  
  return parts.join('. ')
}