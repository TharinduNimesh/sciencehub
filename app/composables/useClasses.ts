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

  return {
    getClasses,
    createClass,
    loading,
    error
  }
}