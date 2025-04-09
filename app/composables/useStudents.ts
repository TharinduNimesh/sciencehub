import type { Database } from '~/types/supabase'

export interface StudentAddress {
  id: number
  street: string
  city: string
  postal_code: number
  student_id: number
  created_at: string
}

export interface StudentContact {
  id: number
  relation: string
  contact_name: string
  details: string
  student_id: number
  created_at: string
}

export interface StudentMonthlyFee {
  id: number
  month: string
  amount: number
  status: 'PAID' | 'PENDING' | 'FREE_PERIOD'
  student_id: number
  paid_at: string | null
  updated_at: string | null
  created_at: string
}

export interface StudentDetails {
  id: number
  name: string
  grade: number
  email: string
  is_active: boolean
  current_month_payment_status: 'PAID' | 'PENDING' | 'FREE_PERIOD'
}

export interface StudentDetailedInfo {
  id: number
  name: string
  email: string
  current_grade: number
  date_of_birth: string
  gender: string
  enrolled_at: string
  is_active: boolean
  contacts: StudentContact[]
  addresses: StudentAddress[]
  monthly_fees: StudentMonthlyFee[]
}

export const useStudents = () => {
  const supabase = useSupabaseClient<Database>()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getStudents = async (): Promise<StudentDetails[]> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: err } = await supabase
        .from('student_details')
        .select('*')
        .order('name', { ascending: true })

      if (err) throw err
      return data as StudentDetails[]
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleStudentStatus = async (studentId: number, isActive: boolean): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('students')
        .update({ is_active: isActive })
        .eq('id', studentId)

      if (err) throw err
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStudentById = async (id: number): Promise<StudentDetailedInfo | null> => {
    try {
      loading.value = true
      error.value = null

      // Get current month in YYYY-MM format
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // Fetch student basic info with profile data
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          current_grade,
          date_of_birth,
          gender,
          enrolled_at,
          is_active,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('id', id)
        .single()

      if (studentError) throw studentError
      if (!student) return null

      // Extract profile from the joined data
      const profile = student.profiles as unknown as { name: string; email: string }

      // Fetch student contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('student_contact')
        .select('*')
        .eq('student_id', id)
        .order('created_at', { ascending: true })

      if (contactsError) throw contactsError

      // Fetch student addresses
      const { data: addresses, error: addressesError } = await supabase
        .from('student_address')
        .select('*')
        .eq('student_id', id)
        .order('created_at', { ascending: true })

      if (addressesError) throw addressesError

      // Fetch student monthly fees
      const { data: monthlyFees, error: feesError } = await supabase
        .from('student_monthly_fees')
        .select('*')
        .eq('student_id', id)
        .order('month', { ascending: false })

      if (feesError) throw feesError

      // Check if current month exists in fees, if not add it with FREE_PERIOD status
      const currentMonthFee = monthlyFees?.find(fee => fee.month === currentMonth)
      const allMonthlyFees = monthlyFees || []
      
      if (!currentMonthFee) {
        allMonthlyFees.unshift({
          id: -1, // Temporary ID for display purposes
          month: currentMonth,
          amount: 0,
          status: 'FREE_PERIOD',
          student_id: id,
          paid_at: null,
          updated_at: null,
          created_at: new Date().toISOString()
        })
      }

      return {
        id: student.id,
        name: profile.name,
        email: profile.email,
        current_grade: student.current_grade,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        enrolled_at: student.enrolled_at,
        is_active: student.is_active,
        contacts: contacts || [],
        addresses: addresses || [],
        monthly_fees: allMonthlyFees
      }
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getStudents,
    toggleStudentStatus,
    getStudentById,
    loading,
    error
  }
}