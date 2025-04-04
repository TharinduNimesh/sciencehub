import type { Database } from '~/types/supabase'

export interface CreateLessonData {
  title: string
  description: string
  duration: number
  videoUrl: string
  thumbnailUrl: string | null
  classIds: number[]  // Changed from classId to classIds to support multiple classes
  resources: {
    type: string
    name: string
    url: string
  }[]
}

export interface Lesson {
  id: number
  title: string
  description: string
  duration: number
  video_url: string
  thumbnail_url: string | null
  created_at: string
}

export interface LessonResource {
  id: number
  type: string
  url: string
  lesson_id: number
  created_at: string
}

export const useLesson = () => {
  const supabase = useSupabaseClient<Database>()
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const createLesson = async (data: CreateLessonData) => {
    try {
      loading.value = true
      error.value = null

      // 1. First create the lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          title: data.title,
          description: data.description,
          duration: data.duration,
          video_url: data.videoUrl,
          thumbnail_url: data.thumbnailUrl
        })
        .select()
        .single()

      if (lessonError) throw lessonError

      // 2. Create the class-lesson associations for all selected classes
      const classLessonData = data.classIds.map(classId => ({
        class_id: classId,
        lesson_id: lessonData.id
      }))

      const { error: classLessonError } = await supabase
        .from('class_lessons')
        .insert(classLessonData)

      if (classLessonError) throw classLessonError

      // 3. Create resources if any
      if (data.resources && data.resources.length > 0) {
        const resources = data.resources.map(resource => ({
          type: resource.type,
          url: resource.url,
          lesson_id: lessonData.id
        }))

        const { error: resourcesError } = await supabase
          .from('lesson_resources')
          .insert(resources)

        if (resourcesError) throw resourcesError
      }

      return lessonData as Lesson
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const getLessonById = async (id: number) => {
    try {
      const { data, error: err } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (err) throw err
      return data as Lesson
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const getLessonResources = async (lessonId: number) => {
    try {
      const { data, error: err } = await supabase
        .from('lesson_resources')
        .select('*')
        .eq('lesson_id', lessonId)

      if (err) throw err
      return data as LessonResource[]
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const getLessonsByClassId = async (classId: number) => {
    try {
      const { data, error: err } = await supabase
        .from('class_lessons')
        .select(`
          lesson_id,
          lessons:lessons(*)
        `)
        .eq('class_id', classId)

      if (err) throw err
      return (data?.map(item => item.lessons as unknown as Lesson) || []) as Lesson[]
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  return {
    createLesson,
    getLessonById,
    getLessonResources,
    getLessonsByClassId,
    loading,
    error
  }
}