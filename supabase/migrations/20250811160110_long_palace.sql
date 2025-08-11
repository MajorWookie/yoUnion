/*
  # Comprehensive Sample Data for Younion Financial Data Application

  This migration seeds the database with realistic sample data including:
  - Apple Inc. company information
  - Multiple SEC filings (10-K, 10-Q, 8-K, DEF 14A)
  - Financial statements with detailed line items
  - Executive compensation data
  - CEO pay ratio information
  - Filing sections with content
*/

-- Insert Apple Inc. company data
INSERT INTO companies (id, ticker, cik, name, ceo_name, logo_url, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'AAPL', '0000320193', 'Apple Inc.', 'Timothy D. Cook', 'https://logo.clearbit.com/apple.com', NOW(), NOW())
ON CONFLICT (ticker) DO NOTHING;

-- Insert sample filings for Apple
INSERT INTO filings (id, company_id, form, accession_no, filed_at, period_start, period_end, sec_url, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '10-K', '0000320193-23-000106', '2023-11-03', '2022-09-25', '2023-09-30', 'https://www.sec.gov/Archives/edgar/data/320193/000032019323000106/aapl-20230930.htm', NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '10-Q', '0000320193-24-000007', '2024-02-02', '2023-10-01', '2023-12-30', 'https://www.sec.gov/Archives/edgar/data/320193/000032019324000007/aapl-20231230.htm', NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '8-K', '0000320193-24-000012', '2024-02-02', NULL, NULL, 'https://www.sec.gov/Archives/edgar/data/320193/000032019324000012/aapl-20240202.htm', NOW()),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'DEF 14A', '0000320193-24-000020', '2024-03-28', NULL, NULL, 'https://www.sec.gov/Archives/edgar/data/320193/000032019324000020/aapl-def14a20240509.htm', NOW())
ON CONFLICT (accession_no) DO NOTHING;

-- Insert financial statements
INSERT INTO financial_statements (id, company_id, filing_id, statement_type, fiscal_year, fiscal_quarter, is_annual, currency, unit, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'income', 2023, NULL, true, 'USD', 'millions', NOW()),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'income', 2024, 1, false, 'USD', 'millions', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert financial lines for FY2023 Annual Income Statement
INSERT INTO financial_lines (statement_id, line_code, label, value, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'NET_SALES', 'Total net sales', 383285, 1),
('550e8400-e29b-41d4-a716-446655440010', 'COGS', 'Cost of sales', 214137, 2),
('550e8400-e29b-41d4-a716-446655440010', 'GROSS_PROFIT', 'Gross margin', 169148, 3),
('550e8400-e29b-41d4-a716-446655440010', 'RD_EXPENSES', 'Research and development', 29915, 4),
('550e8400-e29b-41d4-a716-446655440010', 'SGA_EXPENSES', 'Selling, general and administrative', 24932, 5),
('550e8400-e29b-41d4-a716-446655440010', 'OPERATING_EXPENSES', 'Total operating expenses', 54847, 6),
('550e8400-e29b-41d4-a716-446655440010', 'OPERATING_INCOME', 'Operating income', 114301, 7),
('550e8400-e29b-41d4-a716-446655440010', 'OTHER_INCOME', 'Other income/(expense), net', 565, 8),
('550e8400-e29b-41d4-a716-446655440010', 'PRETAX_INCOME', 'Income before provision for income taxes', 113736, 9),
('550e8400-e29b-41d4-a716-446655440010', 'TAX_EXPENSE', 'Provision for income taxes', 16741, 10),
('550e8400-e29b-41d4-a716-446655440010', 'NET_INCOME', 'Net income', 96995, 11)
ON CONFLICT (id) DO NOTHING;

-- Insert financial lines for Q1 2024 Quarterly Income Statement
INSERT INTO financial_lines (statement_id, line_code, label, value, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'NET_SALES', 'Total net sales', 119575, 1),
('550e8400-e29b-41d4-a716-446655440011', 'COGS', 'Cost of sales', 65775, 2),
('550e8400-e29b-41d4-a716-446655440011', 'GROSS_PROFIT', 'Gross margin', 53800, 3),
('550e8400-e29b-41d4-a716-446655440011', 'RD_EXPENSES', 'Research and development', 7696, 4),
('550e8400-e29b-41d4-a716-446655440011', 'SGA_EXPENSES', 'Selling, general and administrative', 6447, 5),
('550e8400-e29b-41d4-a716-446655440011', 'OPERATING_EXPENSES', 'Total operating expenses', 14143, 6),
('550e8400-e29b-41d4-a716-446655440011', 'OPERATING_INCOME', 'Operating income', 39657, 7),
('550e8400-e29b-41d4-a716-446655440011', 'OTHER_INCOME', 'Other income/(expense), net', 1063, 8),
('550e8400-e29b-41d4-a716-446655440011', 'PRETAX_INCOME', 'Income before provision for income taxes', 40720, 9),
('550e8400-e29b-41d4-a716-446655440011', 'TAX_EXPENSE', 'Provision for income taxes', 6573, 10),
('550e8400-e29b-41d4-a716-446655440011', 'NET_INCOME', 'Net income', 34147, 11)
ON CONFLICT (id) DO NOTHING;

-- Insert CEO pay ratio data
INSERT INTO ceo_pay_ratio (company_id, filing_id, year, ceo_total_comp, median_employee_pay, ratio) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 2023, 63209845, 68254, 926)
ON CONFLICT (id) DO NOTHING;

-- Insert executive compensation data
INSERT INTO executive_comp (company_id, filing_id, executive_name, title, year, salary, bonus, stock_awards, option_awards, non_equity_comp, pension_change, other_comp, total_comp) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Timothy D. Cook', 'Chief Executive Officer', 2023, 3000000, 0, 58814127, 0, 10739718, 0, 1656000, 63209845),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Luca Maestri', 'Senior Vice President, Chief Financial Officer', 2023, 1000000, 0, 25209375, 0, 4608000, 0, 46611, 30863986),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Katherine L. Adams', 'Senior Vice President, General Counsel and Secretary', 2023, 1000000, 0, 25209375, 0, 4608000, 0, 46611, 30863986),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Deirdre O''Brien', 'Senior Vice President, Retail + People', 2023, 1000000, 0, 25209375, 0, 4608000, 0, 46611, 30863986),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'John Ternus', 'Senior Vice President, Hardware Engineering', 2023, 1000000, 0, 25209375, 0, 4608000, 0, 46611, 30863986)
ON CONFLICT (id) DO NOTHING;

-- Insert filing sections
INSERT INTO filing_sections (filing_id, item_code, title, content_text, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '1', 'Business', 'Apple Inc. ("Apple" or the "Company") designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services. The Company''s fiscal year is the 52- or 53-week period that ends on the last Saturday of September. The Company''s fiscal 2023 spanned 52 weeks and ended on September 30, 2023. Unless otherwise stated, references to particular years, quarters, months and dates refer to the Company''s fiscal years ended in September and the associated quarters, months and dates of those fiscal years.', NOW()),
('550e8400-e29b-41d4-a716-446655440001', '1A', 'Risk Factors', 'The Company''s business, reputation, results of operations, financial condition and stock price can be affected by a number of factors, whether currently known or unknown, including those described below. When any one or more of these risks materialize from time to time, the Company''s business, reputation, results of operations, financial condition and stock price can be materially and adversely affected.', NOW()),
('550e8400-e29b-41d4-a716-446655440001', '7', 'Management''s Discussion and Analysis of Financial Condition and Results of Operations', 'The following discussion should be read in conjunction with the consolidated financial statements and accompanying notes included in Part II, Item 8 of this Form 10-K. This section generally discusses 2023 and 2022 items and year-to-year comparisons between 2023 and 2022. Discussions of 2021 items and year-to-year comparisons between 2022 and 2021 that are not included in this Form 10-K can be found in "Management''s Discussion and Analysis of Financial Condition and Results of Operations" in Part II, Item 7 of the Company''s Annual Report on Form 10-K for the fiscal year ended September 24, 2022.', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'COMPENSATION', 'Executive Compensation', 'This section discusses the compensation of our named executive officers for fiscal 2023. Our Compensation Committee believes that our executive compensation program should be designed to attract, motivate, reward and retain the executive talent required to achieve our business objectives and increase stockholder value, while taking into account the competitive market for executive talent, individual and Company performance, and the long-term interests of our stockholders.', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample embeddings (placeholder vectors)
INSERT INTO embeddings (company_id, filing_id, source, chunk_index, content, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'business_section', 1, 'Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories', '{"section": "Business", "item_code": "1", "page": 1}'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'risk_factors', 1, 'The Company''s business can be affected by various risk factors including market competition, supply chain disruptions, and regulatory changes', '{"section": "Risk Factors", "item_code": "1A", "page": 15}'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'mda_section', 1, 'Total net sales increased 3% or $10.9 billion during 2023 compared to 2022', '{"section": "MD&A", "item_code": "7", "page": 25}')
ON CONFLICT (id) DO NOTHING;