/*
  # Comprehensive Database Schema for Younion Financial Data Application

  1. Core Tables
    - `companies` - Public company information with ticker and CIK
    - `filings` - SEC filing metadata with references to companies
    - `filing_sections` - Parsed sections from SEC filings
    - `financial_statements` - Financial statement metadata
    - `financial_lines` - Individual line items from financial statements
    - `executive_comp` - Executive compensation data
    - `ceo_pay_ratio` - CEO pay ratio information
    - `embeddings` - Vector embeddings for RAG system
    - `profiles` - User profile information
    - `audit_log` - System audit trail

  2. Security
    - Enable RLS on all tables
    - Public read access for company/financial data
    - User-specific access for profiles
    - Authenticated access for audit logs

  3. Relationships
    - Proper foreign key constraints with CASCADE deletes
    - UUID primary keys throughout
    - Indexed columns for performance
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker TEXT UNIQUE NOT NULL,
    cik TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    ceo_name TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Filings Table
CREATE TABLE IF NOT EXISTS filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    form TEXT NOT NULL,
    accession_no TEXT UNIQUE NOT NULL,
    filed_at DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    sec_url TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Filing Sections Table
CREATE TABLE IF NOT EXISTS filing_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_id UUID REFERENCES filings(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    title TEXT NOT NULL,
    content_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Statements Table
CREATE TABLE IF NOT EXISTS financial_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    filing_id UUID REFERENCES filings(id) ON DELETE CASCADE,
    statement_type TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER,
    is_annual BOOLEAN NOT NULL,
    currency TEXT DEFAULT 'USD',
    unit TEXT DEFAULT 'thousands',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Lines Table
CREATE TABLE IF NOT EXISTS financial_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID REFERENCES financial_statements(id) ON DELETE CASCADE,
    line_code TEXT NOT NULL,
    label TEXT NOT NULL,
    value NUMERIC NOT NULL,
    order_index INTEGER NOT NULL
);

-- Executive Compensation Table
CREATE TABLE IF NOT EXISTS executive_comp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    filing_id UUID REFERENCES filings(id) ON DELETE CASCADE,
    executive_name TEXT NOT NULL,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    salary NUMERIC DEFAULT 0,
    bonus NUMERIC DEFAULT 0,
    stock_awards NUMERIC DEFAULT 0,
    option_awards NUMERIC DEFAULT 0,
    non_equity_comp NUMERIC DEFAULT 0,
    pension_change NUMERIC DEFAULT 0,
    other_comp NUMERIC DEFAULT 0,
    total_comp NUMERIC NOT NULL
);

-- CEO Pay Ratio Table
CREATE TABLE IF NOT EXISTS ceo_pay_ratio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    filing_id UUID REFERENCES filings(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    ceo_total_comp NUMERIC NOT NULL,
    median_employee_pay NUMERIC NOT NULL,
    ratio NUMERIC NOT NULL
);

-- Embeddings Table
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    filing_id UUID REFERENCES filings(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    dob DATE,
    phone TEXT,
    email TEXT,
    current_employer TEXT,
    unofficial_title TEXT,
    gross_salary NUMERIC,
    start_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    at TIMESTAMPTZ DEFAULT NOW(),
    meta JSONB
);

-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_comp ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_pay_ratio ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create Security Policies

-- Public read access for company-related tables
CREATE POLICY "Public read access" ON companies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON filings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON filing_sections FOR SELECT USING (true);
CREATE POLICY "Public read access" ON financial_statements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON financial_lines FOR SELECT USING (true);
CREATE POLICY "Public read access" ON executive_comp FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ceo_pay_ratio FOR SELECT USING (true);
CREATE POLICY "Public read access" ON embeddings FOR SELECT USING (true);

-- User-specific access for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated access for audit log
CREATE POLICY "Authenticated users can view audit log" ON audit_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert audit log" ON audit_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_cik ON companies(cik);
CREATE INDEX IF NOT EXISTS idx_filings_company_id ON filings(company_id);
CREATE INDEX IF NOT EXISTS idx_filings_form ON filings(form);
CREATE INDEX IF NOT EXISTS idx_filings_filed_at ON filings(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_filing_sections_filing_id ON filing_sections(filing_id);
CREATE INDEX IF NOT EXISTS idx_financial_statements_company_id ON financial_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_statements_fiscal_year ON financial_statements(fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_financial_lines_statement_id ON financial_lines(statement_id);
CREATE INDEX IF NOT EXISTS idx_financial_lines_line_code ON financial_lines(line_code);
CREATE INDEX IF NOT EXISTS idx_executive_comp_company_id ON executive_comp(company_id);
CREATE INDEX IF NOT EXISTS idx_ceo_pay_ratio_company_id ON ceo_pay_ratio(company_id);
CREATE INDEX IF NOT EXISTS idx_ceo_pay_ratio_year ON ceo_pay_ratio(year DESC);
CREATE INDEX IF NOT EXISTS idx_embeddings_company_id ON embeddings(company_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_filing_id ON embeddings(filing_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_at ON audit_log(at DESC);

-- Create vector similarity search index for embeddings
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);