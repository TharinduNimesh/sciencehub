import { useSupabaseClient } from '#imports'

interface JoinRequest {
  id: number
  name: string
  email: string
  mobile: string
  grade: number
  how_did_find_us: string
  created_at: string
}

type Database = {
  public: {
    Tables: {
      join_requests: {
        Row: JoinRequest
        Insert: Omit<JoinRequest, 'id' | 'created_at'>
      }
    }
  }
}

export const useJoinRequests = () => {
  const supabase = useSupabaseClient<Database>()

  const createJoinRequest = async (data: Omit<JoinRequest, 'id' | 'created_at'>) => {
    const { error, data: newRequest } = await supabase
      .from('join_requests')
      .insert(data);

    if (error) {
      throw error
    }

    return newRequest
  }

  return {
    createJoinRequest
  }
}