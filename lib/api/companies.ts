import { supabase } from '@/lib/supabase'
import { CompanyOverview, IncomeStatement, Filing } from '@/lib/schemas'
import { z } from 'zod'

// Custom API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Input validation schemas
const SearchCompaniesSchema = z.object({
  query: z.string().min(1).max(100).transform(str => str.trim()),
  limit: z.number().min(1).max(50).default(20),
})

const GetCompanySchema = z.object({
  ticker: z.string().min(1).max(10).transform(str => str.toUpperCase()),
})

const GetFilingsSchema = z.object({
  companyId: z.string().uuid(),
  forms: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

// Sanitize query to prevent SQL injection
function sanitizeSearchQuery(query: string): string {
  // Escape special characters used in ILIKE patterns
  return query.replace(/[%_\\]/g, '\\$&')
}

export async function searchCompanies(query: string, limit = 20) {
  try {
    // Validate and sanitize inputs
    const validated = SearchCompaniesSchema.parse({ query, limit })
    const sanitizedQuery = sanitizeSearchQuery(validated.query)

    const { data, error } = await supabase
      .from('companies')
      .select('id, ticker, name, logo_url')
      .or(`name.ilike.%${sanitizedQuery}%, ticker.ilike.%${sanitizedQuery}%`)
      .order('name')
      .limit(validated.limit)

    if (error) {
      console.error('Search companies error:', error)
      throw new ApiError(
        'Failed to search companies',
        error.code,
        undefined,
        error
      )
    }

    return data || []
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError('Invalid search parameters', 'VALIDATION_ERROR', 400, error)
    }
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, error)
  }
}

export async function getCompanyOverview(ticker: string): Promise<CompanyOverview> {
  try {
    // Validate input
    const validated = GetCompanySchema.parse({ ticker })

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        id,
        ticker,
        name,
        ceo_name,
        logo_url,
        ceo_pay_ratio (
          year,
          ceo_total_comp,
          median_employee_pay,
          ratio
        )
      `)
      .eq('ticker', validated.ticker)
      .single()

    if (companyError) {
      if (companyError.code === 'PGRST116') {
        throw new ApiError(
          `Company not found: ${validated.ticker}`,
          'NOT_FOUND',
          404,
          companyError
        )
      }
      throw new ApiError(
        'Failed to fetch company overview',
        companyError.code,
        undefined,
        companyError
      )
    }

    const payRatio = company.ceo_pay_ratio?.[0] || null

    return {
      id: company.id,
      ticker: company.ticker,
      name: company.name,
      ceoName: company.ceo_name,
      logoUrl: company.logo_url,
      payRatio: payRatio ? {
        year: payRatio.year,
        ceoTotalComp: payRatio.ceo_total_comp,
        medianEmployeePay: payRatio.median_employee_pay,
        ratio: payRatio.ratio,
      } : null,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError('Invalid ticker format', 'VALIDATION_ERROR', 400, error)
    }
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, error)
  }
}

export async function getIncomeStatement(
  companyId: string,
  fiscalYear?: number,
  isAnnual = true
): Promise<IncomeStatement | null> {
  try {
    // Validate company ID
    if (!z.string().uuid().safeParse(companyId).success) {
      throw new ApiError('Invalid company ID', 'VALIDATION_ERROR', 400)
    }

    let query = supabase
      .from('financial_statements')
      .select(`
        id,
        company_id,
        fiscal_year,
        fiscal_quarter,
        is_annual,
        financial_lines!inner (
          line_code,
          label,
          value,
          order_index
        )
      `)
      .eq('company_id', companyId)
      .eq('statement_type', 'income')
      .eq('is_annual', isAnnual)

    if (fiscalYear) {
      query = query.eq('fiscal_year', fiscalYear)
    }

    const { data, error } = await query
      .order('fiscal_year', { ascending: false })
      .limit(1)
      .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

    if (error) {
      throw new ApiError(
        'Failed to fetch income statement',
        error.code,
        undefined,
        error
      )
    }

    if (!data) {
      return null
    }

    // Validate financial lines exist
    if (!data.financial_lines || !Array.isArray(data.financial_lines)) {
      console.warn('Income statement has no financial lines:', data.id)
      return null
    }

    return {
      id: data.id,
      companyId: data.company_id,
      fiscalYear: data.fiscal_year,
      fiscalQuarter: data.fiscal_quarter,
      isAnnual: data.is_annual,
      lines: data.financial_lines
        .map(line => ({
          lineCode: line.line_code,
          label: line.label,
          value: line.value,
          orderIndex: line.order_index,
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex),
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, error)
  }
}

export async function getCompanyFilings(
  companyId: string,
  forms?: string[],
  limit = 20,
  offset = 0
): Promise<Filing[]> {
  try {
    // Validate inputs
    const validated = GetFilingsSchema.parse({ companyId, forms, limit, offset })

    let query = supabase
      .from('filings')
      .select('id, company_id, form, accession_no, filed_at, period_start, period_end, sec_url')
      .eq('company_id', validated.companyId)

    if (validated.forms && validated.forms.length > 0) {
      query = query.in('form', validated.forms)
    }

    const { data, error } = await query
      .order('filed_at', { ascending: false })
      .range(validated.offset, validated.offset + validated.limit - 1)

    if (error) {
      throw new ApiError(
        'Failed to fetch filings',
        error.code,
        undefined,
        error
      )
    }

    return (data || []).map(filing => ({
      id: filing.id,
      companyId: filing.company_id,
      form: filing.form,
      accessionNo: filing.accession_no,
      filedAt: filing.filed_at,
      periodStart: filing.period_start,
      periodEnd: filing.period_end,
      secUrl: filing.sec_url,
    }))
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError('Invalid filing parameters', 'VALIDATION_ERROR', 400, error)
    }
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, error)
  }
}

// Helper function to handle API errors in components
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NOT_FOUND':
        return 'The requested resource was not found'
      case 'VALIDATION_ERROR':
        return 'Invalid request parameters'
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your connection.'
      default:
        return error.message || 'An error occurred'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}