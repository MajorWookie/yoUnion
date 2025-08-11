/*
  # Seed Sample Data for Younion

  1. Sample Company Data
    - Apple Inc. (AAPL) with sample financial data
    - CEO pay ratio information
    - Sample filings (10-K, 10-Q, DEF 14A)

  2. Sample Financial Data
    - Income statement data for FY2023
    - Quarterly data for Q1-Q3 2023

  3. Sample CEO Compensation
    - Tim Cook compensation data
    - Pay ratio information
*/

-- Insert sample company
INSERT INTO companies (id, ticker, cik, name, ceo_name, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'AAPL',
  '0000320193',
  'Apple Inc.',
  'Timothy D. Cook',
  now(),
  now()
) ON CONFLICT (ticker) DO NOTHING;

-- Insert sample filings
INSERT INTO filings (id, company_id, form, accession_no, filed_at, period_start, period_end, sec_url, created_at)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '10-K',
    '0000320193-23-000077',
    '2023-11-03',
    '2022-09-25',
    '2023-09-30',
    'https://www.sec.gov/Archives/edgar/data/320193/000032019323000077/aapl-20230930.htm',
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    '10-Q',
    '0000320193-23-000064',
    '2023-08-04',
    '2023-04-01',
    '2023-06-30',
    'https://www.sec.gov/Archives/edgar/data/320193/000032019323000064/aapl-20230630.htm',
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'DEF 14A',
    '0000320193-23-000006',
    '2023-01-12',
    NULL,
    NULL,
    'https://www.sec.gov/Archives/edgar/data/320193/000119312523006348/d422982ddef14a.htm',
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440000',
    '8-K',
    '0000320193-23-000076',
    '2023-11-02',
    NULL,
    NULL,
    'https://www.sec.gov/Archives/edgar/data/320193/000032019323000076/aapl-20231102.htm',
    now()
  )
ON CONFLICT (accession_no) DO NOTHING;

-- Insert sample financial statement (Annual FY2023)
INSERT INTO financial_statements (id, company_id, filing_id, statement_type, fiscal_year, fiscal_quarter, is_annual, currency, unit, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'income',
  2023,
  NULL,
  true,
  'USD',
  'millions',
  now()
) ON CONFLICT DO NOTHING;

-- Insert sample financial lines for Apple FY2023 (in millions)
INSERT INTO financial_lines (statement_id, line_code, label, value, order_index)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', 'NET_SALES', 'Total net sales', 383285, 1),
  ('550e8400-e29b-41d4-a716-446655440010', 'COGS', 'Cost of sales', 214137, 2),
  ('550e8400-e29b-41d4-a716-446655440010', 'GROSS_PROFIT', 'Gross margin', 169148, 3),
  ('550e8400-e29b-41d4-a716-446655440010', 'OPERATING_EXPENSES', 'Total operating expenses', 55013, 4),
  ('550e8400-e29b-41d4-a716-446655440010', 'OPERATING_INCOME', 'Operating income', 114301, 5),
  ('550e8400-e29b-41d4-a716-446655440010', 'OTHER_INCOME', 'Other income/(expense), net', -565, 6),
  ('550e8400-e29b-41d4-a716-446655440010', 'PRETAX_INCOME', 'Income before provision for income taxes', 113736, 7),
  ('550e8400-e29b-41d4-a716-446655440010', 'TAX_EXPENSE', 'Provision for income taxes', 16741, 8),
  ('550e8400-e29b-41d4-a716-446655440010', 'NET_INCOME', 'Net income', 96995, 9)
ON CONFLICT DO NOTHING;

-- Insert sample quarterly financial statement (Q3 FY2023)
INSERT INTO financial_statements (id, company_id, filing_id, statement_type, fiscal_year, fiscal_quarter, is_annual, currency, unit, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440002',
  'income',
  2023,
  3,
  false,
  'USD',
  'millions',
  now()
) ON CONFLICT DO NOTHING;

-- Insert sample quarterly financial lines for Apple Q3 FY2023 (in millions)
INSERT INTO financial_lines (statement_id, line_code, label, value, order_index)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440011', 'NET_SALES', 'Total net sales', 81797, 1),
  ('550e8400-e29b-41d4-a716-446655440011', 'COGS', 'Cost of sales', 45384, 2),
  ('550e8400-e29b-41d4-a716-446655440011', 'GROSS_PROFIT', 'Gross margin', 36413, 3),
  ('550e8400-e29b-41d4-a716-446655440011', 'OPERATING_EXPENSES', 'Total operating expenses', 13421, 4),
  ('550e8400-e29b-41d4-a716-446655440011', 'OPERATING_INCOME', 'Operating income', 22992, 5),
  ('550e8400-e29b-41d4-a716-446655440011', 'OTHER_INCOME', 'Other income/(expense), net', -265, 6),
  ('550e8400-e29b-41d4-a716-446655440011', 'PRETAX_INCOME', 'Income before provision for income taxes', 22727, 7),
  ('550e8400-e29b-41d4-a716-446655440011', 'TAX_EXPENSE', 'Provision for income taxes', 2852, 8),
  ('550e8400-e29b-41d4-a716-446655440011', 'NET_INCOME', 'Net income', 19881, 9)
ON CONFLICT DO NOTHING;

-- Insert sample CEO pay ratio data
INSERT INTO ceo_pay_ratio (id, company_id, filing_id, year, ceo_total_comp, median_employee_pay, ratio)
VALUES (
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440003',
  2022,
  99420000,
  68254,
  1447
) ON CONFLICT DO NOTHING;

-- Insert sample executive compensation data
INSERT INTO executive_comp (id, company_id, filing_id, executive_name, title, year, salary, bonus, stock_awards, option_awards, non_equity_comp, pension_change, other_comp, total_comp)
VALUES (
  '550e8400-e29b-41d4-a716-446655440030',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440003',
  'Timothy D. Cook',
  'Chief Executive Officer',
  2022,
  3000000,
  0,
  75000000,
  0,
  12000000,
  0,
  1425000,
  99420000
) ON CONFLICT DO NOTHING;

-- Add a few more sample companies for search functionality
INSERT INTO companies (ticker, cik, name, ceo_name, created_at, updated_at)
VALUES 
  ('MSFT', '0000789019', 'Microsoft Corporation', 'Satya Nadella', now(), now()),
  ('GOOGL', '0001652044', 'Alphabet Inc.', 'Sundar Pichai', now(), now()),
  ('TSLA', '0001318605', 'Tesla, Inc.', 'Elon Musk', now(), now()),
  ('AMZN', '0001018724', 'Amazon.com, Inc.', 'Andrew R. Jassy', now(), now())
ON CONFLICT (ticker) DO NOTHING;