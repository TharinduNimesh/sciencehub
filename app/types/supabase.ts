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
    }
  }
}