import { supabase } from '@/lib/supabase'
import { SignInInput, SignUpInput, BasicInfoInput, EmploymentInfoInput } from '@/lib/schemas'

export async function signUp(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })
  
  if (error) throw error
  return data
}

export async function signIn(input: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })
  
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function updateProfile(basicInfo: BasicInfoInput, employmentInfo?: EmploymentInfoInput) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      first_name: basicInfo.firstName,
      last_name: basicInfo.lastName,
      dob: basicInfo.dob || null,
      phone: basicInfo.phone || null,
      email: user.email,
      current_employer: employmentInfo?.currentEmployer || null,
      unofficial_title: employmentInfo?.unofficialTitle || null,
      gross_salary: employmentInfo?.grossSalary || null,
      start_date: employmentInfo?.startDate || null,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
}

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}