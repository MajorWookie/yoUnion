-- Complete Database Reset and RLS Setup for Younion Database
-- WARNING: This script will DROP ALL EXISTING TABLES and recreate them
-- This ensures a clean database state with proper RLS policies
-- =============================================================================
-- DATABASE RESET - DROP ALL EXISTING OBJECTS
-- =============================================================================
-- Drop all existing policies first (to avoid dependency issues)
DROP POLICY IF EXISTS "Public read access" ON companies;

DROP POLICY IF EXISTS "Public read access" ON filings;

DROP POLICY IF EXISTS "Public read access" ON filing_sections;

DROP POLICY IF EXISTS "Public read access" ON financial_statements;

DROP POLICY IF EXISTS "Public read access" ON financial_lines;

DROP POLICY IF EXISTS "Public read access" ON executive_comp;

DROP POLICY IF EXISTS "Public read access" ON ceo_pay_ratio;

DROP POLICY IF EXISTS "Public read access" ON embeddings;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Authenticated access for audit log" ON audit_log;

DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_log;

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_log;

DROP POLICY IF EXISTS "Admin full access" ON companies;

DROP POLICY IF EXISTS "Admin full access" ON filings;

DROP POLICY IF EXISTS "Admin full access" ON filing_sections;

DROP POLICY IF EXISTS "Admin full access" ON financial_statements;

DROP POLICY IF EXISTS "Admin full access" ON financial_lines;

DROP POLICY IF EXISTS "Admin full access" ON executive_comp;

DROP POLICY IF EXISTS "Admin full access" ON ceo_pay_ratio;

DROP POLICY IF EXISTS "Admin full access" ON embeddings;

DROP POLICY IF EXISTS "Public read access for companies" ON companies;

DROP POLICY IF EXISTS "Admin full access for companies" ON companies;

DROP POLICY IF EXISTS "Public read access for filings" ON filings;

DROP POLICY IF EXISTS "Admin full access for filings" ON filings;

DROP POLICY IF EXISTS "Public read access for filing_sections" ON filing_sections;

DROP POLICY IF EXISTS "Admin full access for filing_sections" ON filing_sections;

DROP POLICY IF EXISTS "Public read access for financial_statements" ON financial_statements;

DROP POLICY IF EXISTS "Admin full access for financial_statements" ON financial_statements;

DROP POLICY IF EXISTS "Public read access for financial_lines" ON financial_lines;

DROP POLICY IF EXISTS "Admin full access for financial_lines" ON financial_lines;

DROP POLICY IF EXISTS "Public read access for executive_comp" ON executive_comp;

DROP POLICY IF EXISTS "Admin full access for executive_comp" ON executive_comp;

DROP POLICY IF EXISTS "Public read access for ceo_pay_ratio" ON ceo_pay_ratio;

DROP POLICY IF EXISTS "Admin full access for ceo_pay_ratio" ON ceo_pay_ratio;

DROP POLICY IF EXISTS "Authenticated read access for embeddings" ON embeddings;

DROP POLICY IF EXISTS "Admin full access for embeddings" ON embeddings;

DROP POLICY IF EXISTS "Admin read access for profiles" ON profiles;

DROP POLICY IF EXISTS "Admin full access for audit_log" ON audit_log;

-- Drop all functions
DROP FUNCTION IF EXISTS check_rls_enabled(text);

DROP FUNCTION IF EXISTS log_user_action(text, text, uuid, jsonb);

DROP FUNCTION IF EXISTS update_updated_at();

-- Drop all triggers
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS audit_log CASCADE;

DROP TABLE IF EXISTS embeddings CASCADE;

DROP TABLE IF EXISTS ceo_pay_ratio CASCADE;

DROP TABLE IF EXISTS executive_comp CASCADE;

DROP TABLE IF EXISTS financial_lines CASCADE;

DROP TABLE IF EXISTS financial_statements CASCADE;

DROP TABLE IF EXISTS filing_sections CASCADE;

DROP TABLE IF EXISTS filings CASCADE;

DROP TABLE IF EXISTS profiles CASCADE;

DROP TABLE IF EXISTS companies CASCADE;

-- Drop and recreate extensions (ensures clean state)
DROP EXTENSION IF EXISTS vector CASCADE;

DROP EXTENSION IF EXISTS pg_trgm CASCADE;

DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- =============================================================================
-- RECREATE EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS vector;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================================================
-- RECREATE ALL TABLES WITH PROPER STRUCTURE
-- =============================================================================
-- Companies Table
CREATE TABLE companies(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker text UNIQUE NOT NULL,
    cik text UNIQUE NOT NULL,
    name text NOT NULL,
    ceo_name text,
    logo_url text,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Filings Table
CREATE TABLE filings(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    form text NOT NULL,
    accession_no text UNIQUE NOT NULL,
    filed_at date NOT NULL,
    period_start date,
    period_end date,
    sec_url text NOT NULL,
    storage_path text,
    created_at timestamptz DEFAULT NOW()
);

-- Filing Sections Table
CREATE TABLE filing_sections(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_id uuid REFERENCES filings(id) ON DELETE CASCADE,
    item_code text NOT NULL,
    title text NOT NULL,
    content_text text NOT NULL,
    created_at timestamptz DEFAULT NOW()
);

-- Financial Statements Table
CREATE TABLE financial_statements(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    filing_id uuid REFERENCES filings(id) ON DELETE CASCADE,
    statement_type text NOT NULL,
    fiscal_year integer NOT NULL,
    fiscal_quarter integer,
    is_annual boolean NOT NULL,
    currency text DEFAULT 'USD',
    unit text DEFAULT 'thousands',
    created_at timestamptz DEFAULT NOW()
);

-- Financial Lines Table
CREATE TABLE financial_lines(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id uuid REFERENCES financial_statements(id) ON DELETE CASCADE,
    line_code text NOT NULL,
    label text NOT NULL,
    value numeric NOT NULL,
    order_index integer NOT NULL
);

-- Executive Compensation Table
CREATE TABLE executive_comp(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    filing_id uuid REFERENCES filings(id) ON DELETE CASCADE,
    executive_name text NOT NULL,
    title text NOT NULL,
    year integer NOT NULL,
    salary numeric DEFAULT 0,
    bonus numeric DEFAULT 0,
    stock_awards numeric DEFAULT 0,
    option_awards numeric DEFAULT 0,
    non_equity_comp numeric DEFAULT 0,
    pension_change numeric DEFAULT 0,
    other_comp numeric DEFAULT 0,
    total_comp numeric NOT NULL
);

-- CEO Pay Ratio Table
CREATE TABLE ceo_pay_ratio(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    filing_id uuid REFERENCES filings(id) ON DELETE CASCADE,
    year integer NOT NULL,
    ceo_total_comp numeric NOT NULL,
    median_employee_pay numeric NOT NULL,
    ratio numeric NOT NULL
);

-- Embeddings Table
CREATE TABLE embeddings(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    filing_id uuid REFERENCES filings(id) ON DELETE CASCADE,
    source text NOT NULL,
    chunk_index integer NOT NULL,
    content text NOT NULL,
    embedding VECTOR(1536),
    metadata jsonb
);

-- Profiles Table
CREATE TABLE profiles(
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
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
);

-- Audit Log Table
CREATE TABLE audit_log(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    entity text NOT NULL,
    entity_id uuid,
    at TIMESTAMPTZ DEFAULT NOW(),
    meta jsonb
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================
-- Companies indexes
CREATE INDEX idx_companies_ticker ON companies(ticker);

CREATE INDEX idx_companies_cik ON companies(cik);

CREATE INDEX idx_companies_name ON companies USING gin(name gin_trgm_ops);

-- Filings indexes
CREATE INDEX idx_filings_company_id ON filings(company_id);

CREATE INDEX idx_filings_form ON filings(form);

CREATE INDEX idx_filings_filed_at ON filings(filed_at DESC);

CREATE INDEX idx_filings_accession_no ON filings(accession_no);

-- Filing sections indexes
CREATE INDEX idx_filing_sections_filing_id ON filing_sections(filing_id);

CREATE INDEX idx_filing_sections_item_code ON filing_sections(item_code);

-- Financial statements indexes
CREATE INDEX idx_financial_statements_company_id ON financial_statements(company_id);

CREATE INDEX idx_financial_statements_filing_id ON financial_statements(filing_id);

CREATE INDEX idx_financial_statements_fiscal_year ON financial_statements(fiscal_year DESC);

-- Financial lines indexes
CREATE INDEX idx_financial_lines_statement_id ON financial_lines(statement_id);

CREATE INDEX idx_financial_lines_line_code ON financial_lines(line_code);

-- Executive compensation indexes
CREATE INDEX idx_executive_comp_company_id ON executive_comp(company_id);

CREATE INDEX idx_executive_comp_year ON executive_comp(year DESC);

-- CEO pay ratio indexes
CREATE INDEX idx_ceo_pay_ratio_company_id ON ceo_pay_ratio(company_id);

CREATE INDEX idx_ceo_pay_ratio_year ON ceo_pay_ratio(year DESC);

-- Embeddings indexes
CREATE INDEX idx_embeddings_company_id ON embeddings(company_id);

CREATE INDEX idx_embeddings_filing_id ON embeddings(filing_id);

CREATE INDEX idx_embeddings_source ON embeddings(source);

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_profiles_current_employer ON profiles(current_employer);

-- Audit log indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

CREATE INDEX idx_audit_log_at ON audit_log(at DESC);

CREATE INDEX idx_audit_log_entity ON audit_log(entity);

-- =============================================================================
-- CREATE HELPER FUNCTIONS
-- =============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================================================
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

-- Drop existing policies to avoid conflicts (idempotent)
DROP POLICY IF EXISTS "Public read access" ON companies;

DROP POLICY IF EXISTS "Public read access" ON filings;

DROP POLICY IF EXISTS "Public read access" ON filing_sections;

DROP POLICY IF EXISTS "Public read access" ON financial_statements;

DROP POLICY IF EXISTS "Public read access" ON financial_lines;

DROP POLICY IF EXISTS "Public read access" ON executive_comp;

DROP POLICY IF EXISTS "Public read access" ON ceo_pay_ratio;

DROP POLICY IF EXISTS "Public read access" ON embeddings;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Authenticated access for audit log" ON audit_log;

DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_log;

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_log;

-- Additional cleanup for any existing policies
DROP POLICY IF EXISTS "Admin full access" ON companies;

DROP POLICY IF EXISTS "Admin full access" ON filings;

DROP POLICY IF EXISTS "Admin full access" ON filing_sections;

DROP POLICY IF EXISTS "Admin full access" ON financial_statements;

DROP POLICY IF EXISTS "Admin full access" ON financial_lines;

DROP POLICY IF EXISTS "Admin full access" ON executive_comp;

DROP POLICY IF EXISTS "Admin full access" ON ceo_pay_ratio;

DROP POLICY IF EXISTS "Admin full access" ON embeddings;

-- =============================================================================
-- PUBLIC FINANCIAL DATA TABLES
-- These contain SEC filing data that should be publicly readable
-- =============================================================================
-- Companies: Public company information
CREATE POLICY "Public read access for companies" ON companies
    FOR SELECT TO public
        USING (TRUE);

-- Allow authenticated users with admin role to manage companies
CREATE POLICY "Admin full access for companies" ON companies
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- Filings: SEC filing metadata
CREATE POLICY "Public read access for filings" ON filings
    FOR SELECT TO public
        USING (TRUE);

CREATE POLICY "Admin full access for filings" ON filings
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- Filing Sections: Parsed content from SEC filings
CREATE POLICY "Public read access for filing_sections" ON filing_sections
    FOR SELECT TO public
        USING (TRUE);

CREATE POLICY "Admin full access for filing_sections" ON filing_sections
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- Financial Statements: Financial statement metadata
CREATE POLICY "Public read access for financial_statements" ON financial_statements
    FOR SELECT TO public
        USING (TRUE);

CREATE POLICY "Admin full access for financial_statements" ON financial_statements
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- Financial Lines: Individual line items from financial statements
CREATE POLICY "Public read access for financial_lines" ON financial_lines
    FOR SELECT TO public
        USING (TRUE);

CREATE POLICY "Admin full access for financial_lines" ON financial_lines
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- Executive Compensation: Executive compensation data
CREATE POLICY "Public read access for executive_comp" ON executive_comp
    FOR SELECT TO public
        USING (TRUE);

CREATE POLICY "Admin full access for executive_comp" ON executive_comp
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- CEO Pay Ratio: CEO pay ratio information
CREATE POLICY "Public read access for ceo_pay_ratio" ON ceo_pay_ratio
    FOR SELECT TO public
        USING (TRUE);

CREATE POLICY "Admin full access for ceo_pay_ratio" ON ceo_pay_ratio
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- Embeddings: Vector embeddings for RAG system
-- Note: These might contain sensitive processed data, so limiting to authenticated users
CREATE POLICY "Authenticated read access for embeddings" ON embeddings
    FOR SELECT TO authenticated
        USING (TRUE);

CREATE POLICY "Admin full access for embeddings" ON embeddings
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- =============================================================================
-- USER-SPECIFIC TABLES
-- These contain personal user data and should be user-scoped
-- =============================================================================
-- Profiles: User profile information (highly sensitive)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
        USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE TO authenticated
        USING (auth.uid() = user_id);

-- Admin access to profiles for support purposes
CREATE POLICY "Admin read access for profiles" ON profiles
    FOR SELECT TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- =============================================================================
-- AUDIT AND SECURITY TABLES
-- These track system usage and should have restricted access
-- =============================================================================
-- Audit Log: System audit trail (security-sensitive)
CREATE POLICY "Users can view own audit logs" ON audit_log
    FOR SELECT TO authenticated
        USING (auth.uid() = user_id);

-- System/service role can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_log
    FOR INSERT TO authenticated
        WITH CHECK (TRUE);

-- Any authenticated request can log actions
-- Admin full access to audit logs for security monitoring
CREATE POLICY "Admin full access for audit_log" ON audit_log
    FOR ALL TO authenticated
        USING (EXISTS (
            SELECT
                1
            FROM
                auth.users
            WHERE
                auth.users.id = auth.uid() AND auth.users.raw_user_meta_data ->> 'role' = 'admin'));

-- =============================================================================
-- HELPER FUNCTION FOR RLS VERIFICATION
-- =============================================================================
-- Function to check if RLS is enabled on a table
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    AS $$
    SELECT
        pg_class.relrowsecurity
    FROM
        pg_class
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE
        pg_namespace.nspname = 'public'
        AND pg_class.relname = table_name;
$$;

-- Grant execute permission to authenticated users (for debugging)
GRANT EXECUTE ON FUNCTION check_rls_enabled(text) TO authenticated;

-- =============================================================================
-- ADDITIONAL SECURITY ENHANCEMENTS
-- =============================================================================
-- Create a function to log user actions (for audit trail)
CREATE OR REPLACE FUNCTION log_user_action(action_name text, entity_name text, entity_id uuid DEFAULT NULL, metadata jsonb DEFAULT NULL)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO audit_log(user_id, action, entity, entity_id, meta)
        VALUES(auth.uid(), action_name, entity_name, entity_id, metadata);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_user_action(text, text, uuid, jsonb) TO authenticated;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Query to verify all tables have RLS enabled
-- Run this to confirm your security setup:
/*
SELECT 
 schemaname,
 tablename,
 rowsecurity as rls_enabled,
 (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN (
 'companies', 'filings', 'filing_sections', 'financial_statements', 
 'financial_lines', 'executive_comp', 'ceo_pay_ratio', 'embeddings', 
 'profiles', 'audit_log'
)
ORDER BY tablename;
 */
-- Query to list all policies
/*
SELECT 
 tablename,
 policyname,
 permissive,
 roles,
 cmd,
 qual,
 with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
 */
