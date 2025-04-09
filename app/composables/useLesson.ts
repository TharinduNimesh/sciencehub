import type { Lesson, CreateLessonData, LessonRow, LessonResource } from '~/types/lesson'
import type { Database } from '~/types/supabase'

interface ClassLesson {
  class_id: number;
  classes: {
    id: number;
    name: string;
    grade: string;
  };
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
          name: resource.name,
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

  const getAllLessons = async () => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: err } = await supabase
        .from('lessons')
        .select(`
          *,
          class_lessons (
            class_id,
            classes (
              id,
              name,
              grade
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;

      return data?.map(lesson => ({
        ...lesson,
        id: lesson.id.toString(),
        classId: lesson.class_lessons?.map((cl: { class_id: number }) => cl.class_id) || [],
        className: formatClassNames(lesson.class_lessons || []),
      })) ?? [] as Lesson[];
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Helper function to format class names with count
  const formatClassNames = (classLessons: ClassLesson[]) => {
    if (!classLessons.length) return 'No Class';
    const firstClass = classLessons[0];
    if (!firstClass?.classes) return 'No Class';
    
    if (classLessons.length === 1) {
      return `Grade ${firstClass.classes.grade} | ${firstClass.classes.name}`;
    }
    return `Grade ${firstClass.classes.grade} | ${firstClass.classes.name} and ${classLessons.length - 1} more`;
  };

  const hideLesson = async (lessonId: number) => {
    try {
      loading.value = true
      error.value = null

      const { error: err } = await supabase
        .from('lessons')
        .update({ is_hidden: true })
        .eq('id', lessonId)

      if (err) throw err

      return true
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLesson = async (data: { 
    id: string;
    title: string;
    description: string;
    duration: number;
    videoUrl: string;
    thumbnailUrl: string | null;
    classIds: number[];
    resources: {
      type: string;
      name: string;
      url: string;
    }[];
  }) => {
    try {
      loading.value = true
      error.value = null

      // 1. Update the lesson basic info
      const { error: lessonError } = await supabase
        .from('lessons')
        .update({
          title: data.title,
          description: data.description,
          duration: data.duration,
          video_url: data.videoUrl,
          thumbnail_url: data.thumbnailUrl
        })
        .eq('id', data.id)

      if (lessonError) throw lessonError

      // 2. Update class associations
      // First delete existing associations
      const { error: deleteClassError } = await supabase
        .from('class_lessons')
        .delete()
        .eq('lesson_id', data.id)

      if (deleteClassError) throw deleteClassError

      // Then create new associations
      const classLessonData = data.classIds.map(classId => ({
        class_id: classId,
        lesson_id: data.id
      }))

      const { error: classLessonError } = await supabase
        .from('class_lessons')
        .insert(classLessonData)

      if (classLessonError) throw classLessonError

      // 3. Update resources
      // First delete existing resources
      const { error: deleteResourcesError } = await supabase
        .from('lesson_resources')
        .delete()
        .eq('lesson_id', data.id)

      if (deleteResourcesError) throw deleteResourcesError

      // Then create new resources
      if (data.resources && data.resources.length > 0) {
        const resources = data.resources.map(resource => ({
          type: resource.type,
          name: resource.name,
          url: resource.url,
          lesson_id: data.id
        }))

        const { error: resourcesError } = await supabase
          .from('lesson_resources')
          .insert(resources)

        if (resourcesError) throw resourcesError
      }

      return true
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    createLesson,
    updateLesson,
    getLessonById,
    getLessonResources,
    getLessonsByClassId,
    getAllLessons,
    hideLesson,
    loading,
    error
  }
}