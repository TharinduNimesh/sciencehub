import type { Database } from './supabase'

export type LessonRow = Database['public']['Tables']['lessons']['Row']
export type ClassLessonRow = Database['public']['Tables']['class_lessons']['Row']

export interface Lesson {
  id: string
  title: string
  description: string
  duration: number
  video_url: string
  thumbnail_url: string | null
  is_hidden: boolean
  created_at: string
  classId?: number[] // Optional array of class IDs
  className: string
  thumbnailUrl?: string
  createdAt?: string
  class_lessons?: Array<{
    class_id: number
    classes: {
      id: number
      name: string
      grade: string
    }
  }>
}

export interface EditableLesson extends Omit<Lesson, 'id' | 'created_at'> {
  id?: string
}

export interface CreateLessonData {
  title: string
  description: string
  duration: number
  videoUrl: string
  thumbnailUrl: string | null
  classIds: number[]
  resources: {
    type: string
    name: string
    url: string
  }[]
}

export interface LessonResource {
  type: string
  name: string | null
  url: string
  lesson_id: number
}