import { supabase } from '@/lib/supabase'
import { CompanyOverview, IncomeStatement, Filing } from '@/lib/schemas'

export async function searchCompanies(query: string, limit = 20) {
  const { data, error } = await supabase
    .from('companies')
    .select('id, ticker, name, logo_url')
    .or(`name.ilike.%${query}%, ticker.ilike.%${query}%`)
    .order('name')
    .limit(limit)

  if (error) throw error
  return data
}

export async function getCompanyOverview(ticker: string): Promise<CompanyOverview> {
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
    .eq('ticker', ticker.toUpperCase())
    .single()

  if (companyError) throw companyError

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
}

export async function getIncomeStatement(
  companyId: string, 
  fiscalYear?: number, 
  isAnnual = true
): Promise<IncomeStatement | null> {
  let query = supabase
    .from('financial_statements')
    .select(`
      id,
      company_id,
      fiscal_year,
      fiscal_quarter,
      is_annual,
      financial_lines (
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
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return {
    id: data.id,
    companyId: data.company_id,
    fiscalYear: data.fiscal_year,
    fiscalQuarter: data.fiscal_quarter,
    isAnnual: data.is_annual,
    lines: data.financial_lines.map(line => ({
      lineCode: line.line_code,
      label: line.label,
      value: line.value,
      orderIndex: line.order_index,
    })).sort((a, b) => a.orderIndex - b.orderIndex),
  }
}

export async function getCompanyFilings(
  companyId: string,
  forms?: string[],
  limit = 20,
  offset = 0
): Promise<Filing[]> {
  let query = supabase
    .from('filings')
    .select('id, company_id, form, accession_no, filed_at, period_start, period_end, sec_url')
    .eq('company_id', companyId)

  if (forms && forms.length > 0) {
    query = query.in('form', forms)
  }

  const { data, error } = await query
    .order('filed_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return data.map(filing => ({
    id: filing.id,
    companyId: filing.company_id,
    form: filing.form,
    accessionNo: filing.accession_no,
    filedAt: filing.filed_at,
    periodStart: filing.period_start,
    periodEnd: filing.period_end,
    secUrl: filing.sec_url,
  }))
}