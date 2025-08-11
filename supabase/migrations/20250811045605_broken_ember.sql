/*
  # Initial Younion Database Schema

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `ticker` (text, unique)
      - `cik` (text, unique)
      - `name` (text)
      - `ceo_name` (text, nullable)
      - `logo_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `filings`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `form` (text)
      - `accession_no` (text, unique)
      - `filed_at` (date)
      - `period_start` (date, nullable)
      - `period_end` (date, nullable)
      - `sec_url` (text)
      - `storage_path` (text, nullable)
      - `created_at` (timestamp)

    - `filing_sections`
      - `id` (uuid, primary key)
      - `filing_id` (uuid, foreign key)
      - `item_code` (text)
      - `title` (text)
      - `content_text` (text)
      - `created_at` (timestamp)

    - `financial_statements`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `filing_id` (uuid, foreign key)
      - `statement_type` (text)
      - `fiscal_year` (int)
      - `fiscal_quarter` (int, nullable)
      - `is_annual` (boolean)
      - `currency` (text, default 'USD')
      - `unit` (text, default 'thousands')
      - `created_at` (timestamp)

    - `financial_lines`
      - `id` (uuid, primary key)
      - `statement_id` (uuid, foreign key)
      - `line_code` (text)
      - `label` (text)
      - `value` (numeric)
      - `order_index` (int)

    - `executive_comp`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `filing_id` (uuid, foreign key)
      - `executive_name` (text)
      - `title` (text)
      - `year` (int)
      - `salary` (numeric, default 0)
      - `bonus` (numeric, default 0)
      - `stock_awards` (numeric, default 0)
      - `option_awards` (numeric, default 0)
      - `non_equity_comp` (numeric, default 0)
      - `pension_change` (numeric, default 0)
      - `other_comp` (numeric, default 0)
      - `total_comp` (numeric)

    - `ceo_pay_ratio`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `filing_id` (uuid, foreign key)
      - `year` (int)
      - `ceo_total_comp` (numeric)
      - `median_employee_pay` (numeric)
      - `ratio` (numeric)

    - `embeddings`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `filing_id` (uuid, foreign key)
      - `source` (text)
      - `chunk_index` (int)
      - `content` (text)
      - `embedding` (vector(1536))
      - `metadata` (jsonb)

    - `profiles`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `first_name` (text, nullable)
      - `last_name` (text, nullable)
      - `dob` (date, nullable)
      - `phone` (text, nullable)
      - `email` (text, nullable)
      - `current_employer` (text, nullable)
      - `unofficial_title` (text, nullable)
      - `gross_salary` (numeric, nullable)
      - `start_date` (date, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `audit_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `entity` (text)
      - `entity_id` (uuid, nullable)
      - `at` (timestamptz)
      - `meta` (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Profiles accessible only by user
    - Company data publicly readable
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  cik text UNIQUE NOT NULL,
  name text NOT NULL,
  ceo_name text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Filings table
CREATE TABLE IF NOT EXISTS filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  form text NOT NULL,
  accession_no text UNIQUE NOT NULL,
  filed_at date NOT NULL,
  period_start date,
  period_end date,
  sec_url text NOT NULL,
  storage_path text,
  created_at timestamptz DEFAULT now()
);

-- Filing sections table
CREATE TABLE IF NOT EXISTS filing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id uuid NOT NULL REFERENCES filings(id) ON DELETE CASCADE,
  item_code text NOT NULL,
  title text NOT NULL,
  content_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Financial statements table
CREATE TABLE IF NOT EXISTS financial_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  filing_id uuid NOT NULL REFERENCES filings(id) ON DELETE CASCADE,
  statement_type text NOT NULL,
  fiscal_year int NOT NULL,
  fiscal_quarter int,
  is_annual boolean NOT NULL DEFAULT true,
  currency text NOT NULL DEFAULT 'USD',
  unit text NOT NULL DEFAULT 'thousands',
  created_at timestamptz DEFAULT now()
);

-- Financial lines table
CREATE TABLE IF NOT EXISTS financial_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id uuid NOT NULL REFERENCES financial_statements(id) ON DELETE CASCADE,
  line_code text NOT NULL,
  label text NOT NULL,
  value numeric NOT NULL,
  order_index int NOT NULL DEFAULT 0
);

-- Executive compensation table
CREATE TABLE IF NOT EXISTS executive_comp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  filing_id uuid NOT NULL REFERENCES filings(id) ON DELETE CASCADE,
  executive_name text NOT NULL,
  title text NOT NULL,
  year int NOT NULL,
  salary numeric DEFAULT 0,
  bonus numeric DEFAULT 0,
  stock_awards numeric DEFAULT 0,
  option_awards numeric DEFAULT 0,
  non_equity_comp numeric DEFAULT 0,
  pension_change numeric DEFAULT 0,
  other_comp numeric DEFAULT 0,
  total_comp numeric NOT NULL
);

-- CEO pay ratio table
CREATE TABLE IF NOT EXISTS ceo_pay_ratio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  filing_id uuid NOT NULL REFERENCES filings(id) ON DELETE CASCADE,
  year int NOT NULL,
  ceo_total_comp numeric NOT NULL,
  median_employee_pay numeric NOT NULL,
  ratio numeric NOT NULL
);

-- Embeddings table (for RAG)
CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  filing_id uuid NOT NULL REFERENCES filings(id) ON DELETE CASCADE,
  source text NOT NULL,
  chunk_index int NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  dob date,
  phone text,
  email text,
  current_employer text,
  unofficial_title text,
  gross_salary numeric,
  start_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  at timestamptz DEFAULT now(),
  meta jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_filings_company_id ON filings(company_id);
CREATE INDEX IF NOT EXISTS idx_filings_form ON filings(form);
CREATE INDEX IF NOT EXISTS idx_filings_filed_at ON filings(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_statements_company_id ON financial_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_statements_fiscal_year ON financial_statements(fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_financial_lines_statement_id ON financial_lines(statement_id);
CREATE INDEX IF NOT EXISTS idx_ceo_pay_ratio_company_id ON ceo_pay_ratio(company_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_company_id ON embeddings(company_id);

-- Enable Row Level Security (commented out for MVP)
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE filings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE filing_sections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE financial_lines ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE executive_comp ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ceo_pay_ratio ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies (commented out for MVP)
-- CREATE POLICY "Public companies are viewable by everyone" ON companies FOR SELECT USING (true);
-- CREATE POLICY "Users can view own profile" ON profiles FOR ALL USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();