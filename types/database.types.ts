export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          at: string | null
          entity: string
          entity_id: string | null
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      ceo_pay_ratio: {
        Row: {
          ceo_total_comp: number
          company_id: string
          filing_id: string
          id: string
          median_employee_pay: number
          ratio: number
          year: number
        }
        Insert: {
          ceo_total_comp: number
          company_id: string
          filing_id: string
          id?: string
          median_employee_pay: number
          ratio: number
          year: number
        }
        Update: {
          ceo_total_comp?: number
          company_id?: string
          filing_id?: string
          id?: string
          median_employee_pay?: number
          ratio?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "ceo_pay_ratio_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ceo_pay_ratio_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          ceo_name: string | null
          cik: string
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          ticker: string
          updated_at: string | null
        }
        Insert: {
          ceo_name?: string | null
          cik: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          ticker: string
          updated_at?: string | null
        }
        Update: {
          ceo_name?: string | null
          cik?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          ticker?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          chunk_index: number
          company_id: string
          content: string
          embedding: string | null
          filing_id: string
          id: string
          metadata: Json | null
          source: string
        }
        Insert: {
          chunk_index: number
          company_id: string
          content: string
          embedding?: string | null
          filing_id: string
          id?: string
          metadata?: Json | null
          source: string
        }
        Update: {
          chunk_index?: number
          company_id?: string
          content?: string
          embedding?: string | null
          filing_id?: string
          id?: string
          metadata?: Json | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embeddings_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_comp: {
        Row: {
          bonus: number | null
          company_id: string
          executive_name: string
          filing_id: string
          id: string
          non_equity_comp: number | null
          option_awards: number | null
          other_comp: number | null
          pension_change: number | null
          salary: number | null
          stock_awards: number | null
          title: string
          total_comp: number
          year: number
        }
        Insert: {
          bonus?: number | null
          company_id: string
          executive_name: string
          filing_id: string
          id?: string
          non_equity_comp?: number | null
          option_awards?: number | null
          other_comp?: number | null
          pension_change?: number | null
          salary?: number | null
          stock_awards?: number | null
          title: string
          total_comp: number
          year: number
        }
        Update: {
          bonus?: number | null
          company_id?: string
          executive_name?: string
          filing_id?: string
          id?: string
          non_equity_comp?: number | null
          option_awards?: number | null
          other_comp?: number | null
          pension_change?: number | null
          salary?: number | null
          stock_awards?: number | null
          title?: string
          total_comp?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "executive_comp_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_comp_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_sections: {
        Row: {
          content_text: string
          created_at: string | null
          filing_id: string
          id: string
          item_code: string
          title: string
        }
        Insert: {
          content_text: string
          created_at?: string | null
          filing_id: string
          id?: string
          item_code: string
          title: string
        }
        Update: {
          content_text?: string
          created_at?: string | null
          filing_id?: string
          id?: string
          item_code?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "filing_sections_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      filings: {
        Row: {
          accession_no: string
          company_id: string
          created_at: string | null
          filed_at: string
          form: string
          id: string
          period_end: string | null
          period_start: string | null
          sec_url: string
          storage_path: string | null
        }
        Insert: {
          accession_no: string
          company_id: string
          created_at?: string | null
          filed_at: string
          form: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          sec_url: string
          storage_path?: string | null
        }
        Update: {
          accession_no?: string
          company_id?: string
          created_at?: string | null
          filed_at?: string
          form?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          sec_url?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "filings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_lines: {
        Row: {
          id: string
          label: string
          line_code: string
          order_index: number
          statement_id: string
          value: number
        }
        Insert: {
          id?: string
          label: string
          line_code: string
          order_index?: number
          statement_id: string
          value: number
        }
        Update: {
          id?: string
          label?: string
          line_code?: string
          order_index?: number
          statement_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_lines_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "financial_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_statements: {
        Row: {
          company_id: string
          created_at: string | null
          currency: string
          filing_id: string
          fiscal_quarter: number | null
          fiscal_year: number
          id: string
          is_annual: boolean
          statement_type: string
          unit: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          currency?: string
          filing_id: string
          fiscal_quarter?: number | null
          fiscal_year: number
          id?: string
          is_annual?: boolean
          statement_type: string
          unit?: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          currency?: string
          filing_id?: string
          fiscal_quarter?: number | null
          fiscal_year?: number
          id?: string
          is_annual?: boolean
          statement_type?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_statements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_statements_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          current_employer: string | null
          dob: string | null
          email: string | null
          first_name: string | null
          gross_salary: number | null
          last_name: string | null
          phone: string | null
          start_date: string | null
          unofficial_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_employer?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          gross_salary?: number | null
          last_name?: string | null
          phone?: string | null
          start_date?: string | null
          unofficial_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_employer?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          gross_salary?: number | null
          last_name?: string | null
          phone?: string | null
          start_date?: string | null
          unofficial_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

