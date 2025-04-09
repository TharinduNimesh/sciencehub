import type { Database } from '~/types/supabase'

export type ClassMethod = 'VirtualRecurringSeries' | 'VirtualSingleSession' | 'InPersonRecurringSeries' | 'InPersonSingleSession'

export interface CreateClassData {
  name: string
  description?: string
  date: string
  startTime: string
  endTime: string
  method: ClassMethod
  tags: string[]
  grade: number
}

export interface Class {
  id: number
  name: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  method: ClassMethod
  is_active: boolean
  tags: string[]
  created_at: string
  grade: number
}

export interface UpdateClassData {
  id: number
  name: string
  description?: string
  date: string
  startTime: string
  endTime: string
  method: ClassMethod
  tags: string[]
  grade: number
}

export interface ClassSession {
  id: number
  date: string
  start_time: string
  end_time: string
  is_cancelled: boolean
  class_id: number
  created_at: string
}

export interface TimeTableEntry {
  id: number
  class_id: number
  name: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  is_cancelled: boolean
  method: ClassMethod
}

export const useClasses = () => {
  const supabase = useSupabaseClient<Database>()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getClasses = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      return data as Class[]
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const getClassById = async (id: number) => {
    const { data, error: err } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single()

    if (err) throw err
    return data as Class
  }

  const createClass = async (data: CreateClassData) => {
    const { error: err } = await supabase
      .from('classes')
      .insert({
        name: data.name,
        description: data.description,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        method: data.method,
        tags: data.tags,
        grade: data.grade
      })

    if (err) throw err
  }

  const updateClass = async (data: UpdateClassData) => {
    const { error: err } = await supabase
      .from('classes')
      .update({
        name: data.name,
        description: data.description,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        method: data.method,
        tags: data.tags,
        grade: data.grade
      })
      .eq('id', data.id)

    if (err) throw err
  }

  const endClass = async (classId: number) => {
    const { error: err } = await supabase
      .from('classes')
      .update({ is_active: false })
      .eq('id', classId)

    if (err) throw err
  }

  const getNextDate = (pattern: string): string | null => {
    try {
      // Get current date in local timezone and set to midnight
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Map weekday patterns to their day numbers (0 = Sunday, 6 = Saturday)
      const weekdayMap: Record<string, number> = {
        'SUN': 0,
        'MON': 1,
        'TUE': 2,
        'WED': 3,
        'THU': 4,
        'FRI': 5,
        'SAT': 6
      }
      
      const targetDay = weekdayMap[pattern]
      if (targetDay === undefined) return null
      
      // Create a new date object in local timezone
      const result = new Date(today)
      const currentDay = today.getDay()
      
      // Calculate days until next occurrence
      let daysUntilNext = targetDay - currentDay
      if (daysUntilNext <= 0) {
        // If target day is today or already passed this week, move to next week
        daysUntilNext += 7
      }
      
      // Add the calculated days to get the next class date
      result.setDate(result.getDate() + daysUntilNext)
      
      // Format the date in YYYY-MM-DD format using local timezone
      const year = result.getFullYear()
      const month = String(result.getMonth() + 1).padStart(2, '0')
      const day = String(result.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
      
    } catch (error) {
      console.error('Error calculating next class date:', error)
      return null
    }
  }

  const getNextSession = async (classId: number, pattern: string) => {
    const nextDate = getNextDate(pattern)
    if (!nextDate) return null

    // Check if there's already a session for this date
    const { data: existingSession } = await supabase
      .from('class_sessions')
      .select('*')
      .eq('class_id', classId)
      .eq('date', nextDate)
      .single()

    return existingSession
  }

  const cancelNextSession = async (classId: number, pattern: string) => {
    try {
      const dateToCancel = getNextDate(pattern)
      if (!dateToCancel) throw new Error('Invalid day pattern')

      const { data, error: err } = await supabase
        .rpc('cancel_class', {
          class_id_input: classId,
          date_input: dateToCancel
        })

      if (err) throw err
      return data
    } catch (error) {
      console.error('Error cancelling class:', error)
      throw error
    }
  }

  const getTimeTable = async () => {
    try {
      const { data, error } = await supabase
        .from('time_table')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0]) // Including today
        .order('date', { ascending: true })

      if (error) throw error
      return data as TimeTableEntry[]
    } catch (error) {
      console.error('Error fetching timetable:', error)
      throw error
    }
  }

  const cancelClassByDate = async (classId: number, date: string) => {
    try {
      const { data, error: err } = await supabase
        .rpc('cancel_class', {
          class_id_input: classId,
          date_input: date
        })

      if (err) throw err
      return data
    } catch (error) {
      console.error('Error cancelling class:', error)
      throw error
    }
  }

  const rescheduleClassByDate = async (classId: number, date: string) => {
    try {
      const { data, error: err } = await supabase
        .rpc('reschedule_class', {
          class_id_input: classId,
          date_input: date
        })

      if (err) throw err
      return data
    } catch (error) {
      console.error('Error rescheduling class:', error)
      throw error
    }
  }

  const getActiveClasses = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (err) throw err
      return data as Class[]
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    endClass,
    loading,
    error,
    getNextSession,
    cancelNextSession,
    getTimeTable,
    cancelClassByDate,
    rescheduleClassByDate,
    getActiveClasses
  }
}