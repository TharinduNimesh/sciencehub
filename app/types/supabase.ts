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