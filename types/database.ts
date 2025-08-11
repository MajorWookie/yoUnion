export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          ticker: string
          cik: string
          name: string
          ceo_name: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticker: string
          cik: string
          name: string
          ceo_name?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticker?: string
          cik?: string
          name?: string
          ceo_name?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      filings: {
        Row: {
          id: string
          company_id: string
          form: string
          accession_no: string
          filed_at: string
          period_start: string | null
          period_end: string | null
          sec_url: string
          storage_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          form: string
          accession_no: string
          filed_at: string
          period_start?: string | null
          period_end?: string | null
          sec_url: string
          storage_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          form?: string
          accession_no?: string
          filed_at?: string
          period_start?: string | null
          period_end?: string | null
          sec_url?: string
          storage_path?: string | null
          created_at?: string
        }
      }
      financial_statements: {
        Row: {
          id: string
          company_id: string
          filing_id: string
          statement_type: string
          fiscal_year: number
          fiscal_quarter: number | null
          is_annual: boolean
          currency: string
          unit: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          filing_id: string
          statement_type: string
          fiscal_year: number
          fiscal_quarter?: number | null
          is_annual: boolean
          currency: string
          unit: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          filing_id?: string
          statement_type?: string
          fiscal_year?: number
          fiscal_quarter?: number | null
          is_annual?: boolean
          currency?: string
          unit?: string
          created_at?: string
        }
      }
      financial_lines: {
        Row: {
          id: string
          statement_id: string
          line_code: string
          label: string
          value: number
          order_index: number
        }
        Insert: {
          id?: string
          statement_id: string
          line_code: string
          label: string
          value: number
          order_index: number
        }
        Update: {
          id?: string
          statement_id?: string
          line_code?: string
          label?: string
          value?: number
          order_index?: number
        }
      }
      ceo_pay_ratio: {
        Row: {
          id: string
          company_id: string
          filing_id: string
          year: number
          ceo_total_comp: number
          median_employee_pay: number
          ratio: number
        }
        Insert: {
          id?: string
          company_id: string
          filing_id: string
          year: number
          ceo_total_comp: number
          median_employee_pay: number
          ratio: number
        }
        Update: {
          id?: string
          company_id?: string
          filing_id?: string
          year?: number
          ceo_total_comp?: number
          median_employee_pay?: number
          ratio?: number
        }
      }
      profiles: {
        Row: {
          user_id: string
          first_name: string | null
          last_name: string | null
          dob: string | null
          phone: string | null
          email: string | null
          current_employer: string | null
          unofficial_title: string | null
          gross_salary: number | null
          start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          first_name?: string | null
          last_name?: string | null
          dob?: string | null
          phone?: string | null
          email?: string | null
          current_employer?: string | null
          unofficial_title?: string | null
          gross_salary?: number | null
          start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          dob?: string | null
          phone?: string | null
          email?: string | null
          current_employer?: string | null
          unofficial_title?: string | null
          gross_salary?: number | null
          start_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}