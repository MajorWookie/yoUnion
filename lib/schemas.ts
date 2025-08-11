import { z } from 'zod'

// Auth schemas
export const SignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Onboarding schemas
export const BasicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().optional(),
  phone: z.string().optional(),
})

export const EmploymentInfoSchema = z.object({
  currentEmployer: z.string().optional(),
  unofficialTitle: z.string().optional(),
  grossSalary: z.number().optional(),
  startDate: z.string().optional(),
})

// API schemas
export const CompanySearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().min(1).max(50).default(20),
})

export const CompanyOverviewSchema = z.object({
  id: z.string().uuid(),
  ticker: z.string(),
  name: z.string(),
  ceoName: z.string().nullable(),
  logoUrl: z.string().url().nullable(),
  payRatio: z.object({
    year: z.number(),
    ceoTotalComp: z.number(),
    medianEmployeePay: z.number(),
    ratio: z.number(),
  }).nullable(),
})

export const IncomeStatementSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  fiscalYear: z.number(),
  fiscalQuarter: z.number().nullable(),
  isAnnual: z.boolean(),
  lines: z.array(z.object({
    lineCode: z.string(),
    label: z.string(),
    value: z.number(),
    orderIndex: z.number(),
  })),
})

export const FilingSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  form: z.string(),
  accessionNo: z.string(),
  filedAt: z.string(),
  periodStart: z.string().nullable(),
  periodEnd: z.string().nullable(),
  secUrl: z.string().url(),
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type SignInInput = z.infer<typeof SignInSchema>
export type BasicInfoInput = z.infer<typeof BasicInfoSchema>
export type EmploymentInfoInput = z.infer<typeof EmploymentInfoSchema>
export type CompanySearch = z.infer<typeof CompanySearchSchema>
export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>
export type IncomeStatement = z.infer<typeof IncomeStatementSchema>
export type Filing = z.infer<typeof FilingSchema>