import type { Database } from '~/types/supabase'

export interface ClassStudentDetails {
  id: number
  student_id: number
  student_name: string
  student_email: string
  class_id: number
  is_active: boolean
  joined_at: string
  active_until: string | null
}

export interface StudentDetails {
  id: number
  name: string
  email: string
  grade: number
  is_active: boolean
}

export const useClassStudents = () => {
  const supabase = useSupabaseClient<Database>()
  const loading = ref(false)

  const getAvailableStudents = async (classId: number, grade: number) => {
    try {
      loading.value = true
      
      // First get already enrolled students
      const { data: enrolledStudents } = await supabase
        .from('class_students_details')
        .select('student_id')
        .eq('class_id', classId)
      
      const enrolledIds = enrolledStudents?.map(s => s.student_id) || []

      // Then get available students from student_details view
      const { data: students, error } = await supabase
        .from('student_details')
        .select('id, name, email, grade, is_active')
        .eq('grade', grade)
        .eq('is_active', true)
        .not('id', 'in', `(${enrolledIds.join(',')})`)

      if (error) throw error
      
      return students as StudentDetails[]
    } finally {
      loading.value = false
    }
  }

  const getStudentsByClassId = async (classId: number) => {
    try {
      loading.value = true
      
      const { data, error } = await supabase
        .from('class_students_details')
        .select('*')
        .eq('class_id', classId)
        .order('joined_at', { ascending: false })

      if (error) throw error

      return data as ClassStudentDetails[]
    } finally {
      loading.value = false
    }
  }

  const addStudentToClass = async (classId: number, studentId: number) => {
    const { error } = await supabase
      .from('class_has_student')
      .insert({
        class_id: classId,
        student_id: studentId,
        is_active: true,
        joined_at: new Date().toISOString()
      })

    if (error) throw error
  }

  const toggleStudentStatus = async (studentId: number, classId: number, activate: boolean) => {
    const { error } = await supabase
      .from('class_has_student')
      .update({ 
        is_active: activate,
        active_until: activate ? null : new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('class_id', classId)

    if (error) throw error
  }

  return {
    getAvailableStudents,
    getStudentsByClassId,
    addStudentToClass,
    toggleStudentStatus,
    loading
  }
}