import { useSupabaseClient } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { ref } from 'vue'

export const useStudentId = () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()
  const studentId = ref<number|null>(null)
  const loading = ref(false)
  const error = ref<Error|null>(null)

  const getStudentId = async () => {
    loading.value = true
    error.value = null
    try {
      if (!authStore.user?.id) throw new Error('No user id')
      // Use Supabase function or query to get student id by user id
      const { data, error: err } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', authStore.user.id)
        .single()
      if (err) throw err
      studentId.value = data?.id || null
      return studentId.value
    } catch (err2) {
      error.value = err2 as Error
      studentId.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return { studentId, getStudentId, loading, error }
}
