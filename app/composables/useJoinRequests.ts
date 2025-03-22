interface JoinRequestDB {
  id: number
  name: string
  email: string
  mobile: string
  grade: number
  how_did_find_us: string
  created_at: string
}

interface JoinRequestStatusDB {
  id: number
  status: boolean | null
  updated_at: string | null
  created_at: string
}

// Frontend type that combines both DB types and maps to UI requirements
export interface JoinRequest {
  id: number
  name: string
  email: string
  grade: number
  contactNumber: string
  referralSource: string
  status: 'Pending' | 'Accepted' | 'Rejected'
  requestedAt: string
  acceptedAt: string | null
  invitationStatus: 'Sent' | 'Accepted' | 'Expired' | 'Deleted' | null
}

type Database = {
  public: {
    Tables: {
      join_requests: {
        Row: JoinRequestDB
        Insert: Omit<JoinRequestDB, 'id' | 'created_at'>
      }
      join_request_status: {
        Row: JoinRequestStatusDB
        Insert: Omit<JoinRequestStatusDB, 'id' | 'created_at'>
      }
    }
  }
}

export const useJoinRequests = () => {
  const supabase = useSupabaseClient<Database>()
  const { fetchInvitations } = useInvitations()

  const createJoinRequest = async (data: Omit<JoinRequestDB, 'id' | 'created_at'>) => {
    const { error, data: newRequest } = await supabase
      .from('join_requests')
      .insert(data);

    if (error) {
      throw error
    }

    return newRequest
  }

  const fetchJoinRequests = async (): Promise<JoinRequest[]> => {
    // Fetch join requests
    const { data: requests, error } = await supabase
      .from('join_requests')
      .select(`
        *,
        join_request_status (
          status,
          updated_at
        )
      `)

    if (error) {
      throw error
    }

    // Fetch all invitations
    const invitations = await fetchInvitations()
    const invitationsByEmail = new Map(
      invitations.map(inv => [inv.email.toLowerCase(), inv])
    )

    // Map DB data to frontend format
    return requests.map(request => {
      const invitation = invitationsByEmail.get(request.email.toLowerCase())
      let invitationStatus: JoinRequest['invitationStatus'] = null
      const isAccepted = request.join_request_status?.status === true

      // If request is accepted but no invitation found, mark as deleted
      if (isAccepted && !invitation) {
        invitationStatus = 'Deleted'
      } else if (invitation) {
        if (invitation.status === 'Used') {
          invitationStatus = 'Accepted'
        } else if (invitation.status === 'Expired' || invitation.status === 'Revoked') {
          invitationStatus = 'Expired'
        } else {
          invitationStatus = 'Sent'
        }
      }

      return {
        id: request.id,
        name: request.name,
        email: request.email,
        grade: request.grade,
        contactNumber: request.mobile,
        referralSource: request.how_did_find_us,
        status: !request.join_request_status || request.join_request_status.status === null 
          ? 'Pending' 
          : request.join_request_status.status ? 'Accepted' : 'Rejected',
        requestedAt: request.created_at,
        acceptedAt: request.join_request_status?.status ? request.join_request_status.updated_at : null,
        invitationStatus
      }
    })
  }

  const updateRequestStatus = async (id: number, status: boolean) => {
    const { error } = await supabase
      .from('join_request_status')
      .upsert({
        id,
        status,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }
  }

  const deleteJoinRequest = async (id: number) => {
    // Delete from join_request_status first (if exists)
    const { error: statusError } = await supabase
      .from('join_request_status')
      .delete()
      .eq('id', id)

    // Even if there's an error deleting status (might not exist), proceed with deleting the request
    const { error } = await supabase
      .from('join_requests')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  return {
    createJoinRequest,
    fetchJoinRequests,
    updateRequestStatus,
    deleteJoinRequest
  }
}