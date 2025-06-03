import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/supabase'

export interface Quiz {
  id: number
  title: string
  description: string | null
  instructions: string | null
  form_link: string
  duration: number | null
  created_at: string
  started_at: string
  ended_at: string
  classes?: Array<{ id: number; name: string }>
}

export interface CreateQuizData {
  title: string
  description?: string
  instructions?: string
  googleFormLink: string
  duration?: number | null
  startDateTime: string
  endDateTime: string
  selectedClasses: number[]
}

export interface UpdateQuizData {
  id: number
  title: string
  description?: string
  instructions?: string
  googleFormLink: string
  duration?: number | null
  startDateTime: string
  endDateTime: string
  selectedClasses: number[]
}

export const useQuizzes = () => {
  const supabase = useSupabaseClient<Database>()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const createQuiz = async (data: CreateQuizData) => {
    loading.value = true
    error.value = null
    try {
      // Insert quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: data.title,
          description: data.description || null,
          instructions: data.instructions || null,
          form_link: data.googleFormLink,
          duration: data.duration ? Number(data.duration) : null,
          started_at: data.startDateTime,
          ended_at: data.endDateTime
        })
        .select()
        .single()
      if (quizError) throw quizError
      // Insert classes
      if (data.selectedClasses.length > 0) {
        const classRows = data.selectedClasses.map(classId => ({
          quiz_id: quiz.id,
          class_id: classId
        }))
        const { error: classError } = await supabase
          .from('quizzes_has_classes')
          .insert(classRows)
        if (classError) throw classError
      }
      return quiz
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const getQuizById = async (quizId: number) => {
    loading.value = true
    error.value = null
    try {
      // Get quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()
      if (quizError) throw quizError
      // Get classes
      const { data: classLinks, error: classError } = await supabase
        .from('quizzes_has_classes')
        .select('class_id, classes (id, name)')
        .eq('quiz_id', quizId)
      if (classError) throw classError
      const classes = (classLinks || []).map(link => link.classes)
      return { ...quiz, classes }
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateQuiz = async (data: UpdateQuizData) => {
    loading.value = true
    error.value = null
    try {
      // Update quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: data.title,
          description: data.description || null,
          instructions: data.instructions || null,
          form_link: data.googleFormLink,
          duration: data.duration ? Number(data.duration) : null,
          started_at: data.startDateTime,
          ended_at: data.endDateTime
        })
        .eq('id', data.id)
      if (quizError) throw quizError
      // Update classes: remove old, insert new
      await supabase.from('quizzes_has_classes').delete().eq('quiz_id', data.id)
      if (data.selectedClasses.length > 0) {
        const classRows = data.selectedClasses.map(classId => ({
          quiz_id: data.id,
          class_id: classId
        }))
        const { error: classError } = await supabase
          .from('quizzes_has_classes')
          .insert(classRows)
        if (classError) throw classError
      }
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const closeQuiz = async (quizId: number) => {
    loading.value = true
    error.value = null
    try {
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({ is_active: false })
        .eq('id', quizId)
      if (quizError) throw quizError
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    createQuiz,
    getQuizById,
    updateQuiz,
    closeQuiz,
    loading,
    error
  }
}
