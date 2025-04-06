export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: number
          current_grade: number
          date_of_birth: string
          gender: 'MALE' | 'FEMALE'
          user_id: string
          enrolled_at: string
        }
        Insert: {
          current_grade: number
          date_of_birth: string
          gender: 'MALE' | 'FEMALE'
          user_id: string
          enrolled_at?: string
        }
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
      }
      classes: {
        Row: {
          id: bigint
          name: string
          description: string | null
          date: string
          start_time: string
          end_time: string
          method: 'VirtualRecurringSeries' | 'VirtualSingleSession' | 'InPersonRecurringSeries' | 'InPersonSingleSession'
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
          method: 'VirtualRecurringSeries' | 'VirtualSingleSession' | 'InPersonRecurringSeries' | 'InPersonSingleSession'
          is_active?: boolean
          tags: string[]
          grade: number
        }
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
          id: bigint
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
      }
      lesson_resources: {
        Row: {
          id: bigint
          type: string
          url: string
          lesson_id: bigint
          created_at: string
        }
        Insert: {
          type: string
          url: string
          lesson_id: bigint
        }
      }
      class_lessons: {
        Row: {
          id: bigint
          class_id: bigint
          lesson_id: bigint
          created_at: string
        }
        Insert: {
          class_id: bigint
          lesson_id: bigint
        }
      }
      learning_resources_and_notices: {
        Row: {
          id: bigint
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
      }
      class_has_resources: {
        Row: {
          id: bigint
          resource_id: bigint
          class_id: bigint
          created_at: string
        }
        Insert: {
          resource_id: bigint
          class_id: bigint
          created_at?: string
        }
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