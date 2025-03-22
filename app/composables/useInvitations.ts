interface InvitationDB {
  id: bigint
  name: string
  email: string
  role: 'ADMIN' | 'MODERATOR' | 'STUDENT'
  token: string
  metadata: Record<string, any>
  is_revoked: boolean
  invited_at: string
  expired_at: string
  created_at: string
  invited_by: string
  is_mail_sent: boolean
}

interface InvitationStatusDB {
  id: bigint
  is_accepted: boolean | null
  is_used: boolean
  used_at: string | null
  created_at: string
}

// Frontend type
export interface Invitation {
  id: number
  name: string
  email: string
  grade: number
  invitedAt: string
  expiredAt: string
  invitedBy: string
  status: 'Pending' | 'Expired' | 'Revoked' | 'Rejected' | 'Accepted' | 'Used'
}

type Database = {
  public: {
    Tables: {
      invitations: {
        Row: InvitationDB
        Insert: Omit<InvitationDB, 'id' | 'created_at' | 'token' | 'invited_at' | 'is_mail_sent' | 'is_revoked'>
      }
      invitation_status: {
        Row: InvitationStatusDB
      }
    }
  }
}

export const useInvitations = () => {
  const supabase = useSupabaseClient<Database>()
  const config = useRuntimeConfig()

  const calculateExpirationDate = (days: number) => {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)
    return expiresAt.toISOString()
  }

  const sendInvitationEmail = async (invitation: InvitationDB) => {
    try {
      const { error } = await useFetch('/api/invitations/send', {
        method: 'POST',
        body: {
          invitation,
          baseUrl: config.public.appUrl
        }
      })

      if (error.value) {
        throw error.value
      }
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      throw error
    }
  }

  const createInvitation = async (data: {
    email: string
    name: string
    grade?: number
    expiresIn?: number
    role?: 'STUDENT' | 'MODERATOR'
  }) => {
    const expiresAt = calculateExpirationDate(data.expiresIn || 7)
    const metadata = data.grade ? { grade: data.grade } : {}

    // First create the invitation
    const { error: invitationError, data: newInvitation } = await supabase
      .from('invitations')
      .insert({
        email: data.email,
        name: data.name,
        role: data.role || 'STUDENT',
        metadata,
        expired_at: expiresAt
      })
      .select()
      .single()

    if (invitationError) {
      throw invitationError
    }

    // Send invitation email
    try {
      await sendInvitationEmail(newInvitation)
    } catch (error) {
      // If email fails, we should still return success as the invitation is created
      console.error('Failed to send invitation email:', error)
    }

    return newInvitation
  }

  const fetchInvitations = async (): Promise<Invitation[]> => {
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        profiles!invitations_invited_by_fkey (
          name
        ),
        invitation_status!invitation_status_id_fkey (
          is_accepted,
          is_used,
          used_at
        )
      `)
      .eq('role', 'STUDENT')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return invitations.map(invitation => ({
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      grade: invitation.metadata?.grade || 0,
      invitedAt: invitation.invited_at,
      expiredAt: invitation.expired_at,
      invitedBy: invitation.profiles?.name || 'Unknown',
      status: getInvitationStatus(invitation)
    }))
  }

  const getInvitationStatus = (invitation: {
    is_revoked: boolean
    expired_at: string
    invitation_status: { 
      is_accepted: boolean | null
      is_used: boolean 
    } | null
  }): Invitation['status'] => {
    // If invitation is revoked by admin/moderator
    if (invitation.is_revoked) {
      return 'Revoked'
    }

    // Check invitation_status
    if (invitation.invitation_status) {
      // If invitation is used (account created)
      if (invitation.invitation_status.is_used) {
        return 'Used'
      }
      
      // If invitation is explicitly rejected
      if (invitation.invitation_status.is_accepted === false) {
        return 'Rejected'
      }
      
      // If invitation is accepted but not used yet
      if (invitation.invitation_status.is_accepted === true) {
        return 'Accepted'
      }
    }

    // Check if invitation has expired
    if (new Date(invitation.expired_at) < new Date()) {
      return 'Expired'
    }

    // If none of the above, invitation is still pending
    return 'Pending'
  }

  const updateInvitationStatus = async (id: number) => {
    const { error } = await supabase
      .from('invitations')
      .update({ is_revoked: true })
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  const checkExpiredInvitations = async () => {
    const now = new Date().toISOString()
    
    // Get all invitations that should be expired
    const { data: expiredInvitations, error: fetchError } = await supabase
      .from('invitations')
      .select('id')
      .eq('is_revoked', false)
      .lt('expired_at', now)
      .is('invitation_status.is_accepted', null)

    if (fetchError) {
      throw fetchError
    }

    if (!expiredInvitations?.length) {
      return
    }

    // Mark them as revoked
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ is_revoked: true })
      .in('id', expiredInvitations.map(inv => inv.id))

    if (updateError) {
      throw updateError
    }
  }

  const deleteInvitation = async (id: number) => {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  return {
    createInvitation,
    fetchInvitations,
    updateInvitationStatus,
    checkExpiredInvitations,
    deleteInvitation,
    sendInvitationEmail // Export for manual resend capability
  }
}