import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchCompanies, getCompanyOverview } from '@/lib/api/companies'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [
                { id: '1', ticker: 'AAPL', name: 'Apple Inc.', logo_url: null }
              ],
              error: null
            }))
          }))
        }))
      })),
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: {
            id: '1',
            ticker: 'AAPL',
            name: 'Apple Inc.',
            ceo_name: 'Tim Cook',
            logo_url: null,
            ceo_pay_ratio: [{ year: 2023, ceo_total_comp: 99000000, median_employee_pay: 68000, ratio: 1456 }]
          },
          error: null
        }))
      }))
    }))
  }
}))

describe('Companies API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchCompanies', () => {
    it('should search companies by query', async () => {
      const result = await searchCompanies('Apple')
      
      expect(result).toEqual([
        { id: '1', ticker: 'AAPL', name: 'Apple Inc.', logo_url: null }
      ])
      expect(supabase.from).toHaveBeenCalledWith('companies')
    })
  })

  describe('getCompanyOverview', () => {
    it('should return company overview with pay ratio', async () => {
      const result = await getCompanyOverview('AAPL')
      
      expect(result).toEqual({
        id: '1',
        ticker: 'AAPL',
        name: 'Apple Inc.',
        ceoName: 'Tim Cook',
        logoUrl: null,
        payRatio: {
          year: 2023,
          ceoTotalComp: 99000000,
          medianEmployeePay: 68000,
          ratio: 1456
        }
      })
    })
  })
})