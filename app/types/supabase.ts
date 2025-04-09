export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ClassMethod = 'VirtualRecurringSeries' | 'VirtualSingleSession' | 'InPersonRecurringSeries' | 'InPersonSingleSession'

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: number
          user_id: string
          current_grade: number
          date_of_birth: string
          gender: string
          enrolled_at: string
          is_active: boolean
        }
        Insert: {
          user_id: string
          current_grade: number
          date_of_birth: string
          gender: string
          is_active?: boolean
        }
        Update: Partial<{
          user_id: string
          current_grade: number
          date_of_birth: string
          gender: string
          is_active: boolean
        }>
      }
      student_contact: {
        Row: {
          id: number
          relation: string
          contact_name: string
          details: string
          student_id: number
          created_at: string
        }
        Insert: {
          relation: string
          contact_name: string
          details: string
          student_id: number
          created_at?: string
        }
        Update: Partial<{
          relation: string
          contact_name: string
          details: string
          student_id: number
        }>
      }
      student_address: {
        Row: {
          id: number
          street: string
          city: string
          postal_code: number
          student_id: number
          created_at: string
        }
        Insert: {
          street: string
          city: string
          postal_code: number
          student_id: number
          created_at?: string
        }
        Update: Partial<{
          street: string
          city: string
          postal_code: number
          student_id: number
        }>
      }
      classes: {
        Row: {
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
        Insert: {
          name: string
          description?: string | null
          date: string
          start_time: string
          end_time: string
          method: ClassMethod
          is_active?: boolean
          tags?: string[]
          grade: number
        }
        Update: Partial<{
          name: string
          description: string | null
          date: string
          start_time: string
          end_time: string
          method: ClassMethod
          is_active: boolean
          tags: string[]
          grade: number
        }>
      }
      join_requests: {
        Row: {
          id: number
          name: string
          email: string
          mobile: string
          grade: number
          how_did_find_us: string
          created_at: string
        }
        Insert: {
          name: string
          email: string
          mobile: string
          grade: number
          how_did_find_us: string
        }
        Update: Partial<{
          name: string
          email: string
          mobile: string
          grade: number
          how_did_find_us: string
        }>
      }
      join_request_status: {
        Row: {
          id: number
          status: boolean | null
          updated_at: string | null
          created_at: string
        }
        Insert: {
          id: number
          status?: boolean | null
          updated_at?: string | null
        }
        Update: Partial<{
          status: boolean | null
          updated_at: string | null
        }>
      }
      class_sessions: {
        Row: {
          id: number
          date: string
          start_time: string
          end_time: string
          is_cancelled: boolean
          class_id: number
          created_at: string
        }
        Insert: {
          date: string
          start_time: string
          end_time: string
          is_cancelled?: boolean
          class_id: number
        }
        Update: Partial<{
          date: string
          start_time: string
          end_time: string
          is_cancelled: boolean
          class_id: number
        }>
      }
      class_has_student: {
        Row: {
          id: number
          class_id: number
          student_id: number
          is_active: boolean
          joined_at: string
          active_until: string | null
        }
        Insert: {
          class_id: number
          student_id: number
          is_active?: boolean
          joined_at: string
          active_until?: string | null
        }
        Update: Partial<{
          class_id: number
          student_id: number
          is_active: boolean
          joined_at: string
          active_until: string | null
        }>
      }
      class_has_moderator: {
        Row: {
          id: number
          class_id: number
          moderator_id: number
          is_active: boolean
          joined_at: string
          active_until: string | null
        }
        Insert: {
          class_id: number
          moderator_id: number
          is_active?: boolean
          joined_at: string
          active_until?: string | null
        }
        Update: Partial<{
          class_id: number
          moderator_id: number
          is_active: boolean
          joined_at: string
          active_until: string | null
        }>
      }
      invitations: {
        Row: {
          id: number
          name: string
          email: string
          role: 'ADMIN' | 'MODERATOR' | 'STUDENT'
          metadata: Record<string, any>
          is_revoked: boolean
          invited_at: string
          expired_at: string
          created_at: string
          is_mail_sent: boolean
          is_accepted: boolean | null
          is_used: boolean
          used_at: string | null
          invited_by: string | null
        }
        Insert: {
          name: string
          email: string
          role: 'ADMIN' | 'MODERATOR' | 'STUDENT'
          metadata?: Record<string, any>
          expired_at: string
          is_revoked?: boolean
          is_mail_sent?: boolean
          is_accepted?: boolean | null
          is_used?: boolean
          used_at?: string | null
          invited_by?: string | null
        }
      }
      lessons: {
        Row: {
          id: number
          title: string
          description: string
          duration: number
          video_url: string
          thumbnail_url: string | null
          created_at: string
          is_hidden: boolean
        }
        Insert: {
          title: string
          description: string
          duration: number
          video_url: string
          thumbnail_url?: string | null
          is_hidden?: boolean
        }
        Update: Partial<{
          title: string
          description: string
          duration: number
          video_url: string
          thumbnail_url: string | null
          is_hidden: boolean
        }>
      }
      lesson_resources: {
        Row: {
          id: number
          type: string
          url: string
          lesson_id: number
          created_at: string
        }
        Insert: {
          type: string
          url: string
          lesson_id: number
        }
        Update: Partial<{
          type: string
          url: string
          lesson_id: number
        }>
      }
      class_lessons: {
        Row: {
          id: number
          class_id: number
          lesson_id: number
          created_at: string
        }
        Insert: {
          class_id: number
          lesson_id: number
        }
        Update: Partial<{
          class_id: number
          lesson_id: number
        }>
      }
      learning_resources_and_notices: {
        Row: {
          id: number
          title: string
          description: string | null
          type: 'notice' | 'resource'
          resource_type: 'Document' | 'Video' | 'Image' | 'Link'
          url: string
          created_at: string
        }
        Insert: {
          title: string
          description?: string | null
          type: 'notice' | 'resource'
          resource_type: 'Document' | 'Video' | 'Image' | 'Link'
          url: string
          created_at?: string
        }
        Update: Partial<{
          title: string
          description: string | null
          type: 'notice' | 'resource'
          resource_type: 'Document' | 'Video' | 'Image' | 'Link'
          url: string
        }>
      }
      class_has_resources: {
        Row: {
          id: number
          resource_id: number
          class_id: number
          created_at: string
        }
        Insert: {
          resource_id: number
          class_id: number
          created_at?: string
        }
        Update: Partial<{
          resource_id: number
          class_id: number
        }>
      }
    }
    Views: {
      invitation_details: {
        Row: {
          id: number
          name: string
          email: string
          role: 'ADMIN' | 'MODERATOR' | 'STUDENT'
          metadata: Record<string, any>
          is_revoked: boolean
          invited_at: string
          expired_at: string
          created_at: string
          invited_by_name: string | null
          is_accepted: boolean | null
          is_used: boolean
          used_at: string | null
        }
      }
    }
    Functions: {
      get_new_student_id: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: {
      GENDER: 'MALE' | 'FEMALE' | 'OTHER'
    }
  }
}

// Frontend types
export interface Invitation {
  id: number
  name: string
  email: string
  grade?: number
  classes?: Array<{ id: number; name: string }>
  invitedAt: string
  expiredAt: string
  invitedBy: string
  status: 'Pending' | 'Expired' | 'Revoked' | 'Rejected' | 'Accepted' | 'Used'
}

// Add these interface definitions at the end of the file
export interface ClassSessionWithClass {
  id: number
  date: string
  start_time: string
  end_time: string
  is_cancelled: boolean
  class_id: number
  classes: {
    name: string
    grade: number
    method: ClassMethod
  }
}

export interface ClassWithModerators {
  id: number
  name: string
  grade: number
  date: string
  start_time: string
  end_time: string
  method: ClassMethod
  is_active: boolean
  moderators: Array<{
    moderators: {
      name: string
    }
  }>
}