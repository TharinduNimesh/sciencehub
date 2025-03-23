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
  grade?: number
  classes?: Array<{ id: number; name: string }>
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

  const calculateExpirationDate = (days: number): string => {
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

  const validateInvitation = async (email: string) => {
    // Check if there's an invitation
    const { data: existingInvitation, error: fetchError } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Handle error if not due to no existing invitation
      throw fetchError
    }
    
    if (existingInvitation) {
      throw new Error('An invitation already exists for this email.')
    }

    // Check if user already exists
    const { data: isUserAlreadyRegistered, error: isUserAlreadyRegisteredError } 
      = await supabase
      .rpc('is_user_already_registered', {
        email_input: email
    })

    if (isUserAlreadyRegisteredError) {
      throw isUserAlreadyRegisteredError
    }

    if (isUserAlreadyRegistered) {
      throw new Error('A user already exists with this email.')
    }
  }

  const createInvitation = async (data: {
    email: string
    name: string
    grade?: number
    classes?: Array<{ id: number; name: string }>
    expiresIn?: number
    role?: 'STUDENT' | 'MODERATOR'
  }) => {
    // Validate the invitation first
    await validateInvitation(data.email)

    const expiresAt = calculateExpirationDate(data.expiresIn || 7)
    const metadata: Record<string, any> = {}
    
    // Set role-specific metadata
    if (data.role === 'STUDENT' && data.grade) {
      metadata.grade = data.grade
    } else if (data.role === 'MODERATOR' && data.classes) {
      metadata.classes = data.classes
    }

    // Create the invitation
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

  const fetchInvitations = async (role?: 'STUDENT' | 'MODERATOR'): Promise<Invitation[]> => {
    let query = supabase
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
      .order('created_at', { ascending: false })

    // Add role filter if specified
    if (role) {
      query = query.eq('role', role)
    }

    const { data: invitations, error } = await query

    if (error) {
      throw error
    }

    return invitations.map(invitation => ({
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      ...(invitation.metadata?.grade ? { grade: invitation.metadata.grade } : {}),
      ...(invitation.metadata?.classes ? { classes: invitation.metadata.classes } : {}),
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

  const resendInvitation = async (invitationId: number) => {
    // Fetch the current invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    // Calculate new expiration date
    const expiresAt = calculateExpirationDate(7) // Reset to 7 days from now

    // Update invitation status
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('invitations')
      .update({
        expired_at: expiresAt,
        is_revoked: false, // Reset revoked status if it was revoked
        is_mail_sent: false, // Reset mail sent status so we can track the new email
        invited_at: new Date().toISOString() // Update invited_at to current time
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Send the invitation email
    try {
      await sendInvitationEmail(updatedInvitation)

      // Update mail sent status
      const { error: mailSentError } = await supabase
        .from('invitations')
        .update({ is_mail_sent: true })
        .eq('id', invitationId)

      if (mailSentError) {
        console.error('Failed to update mail sent status:', mailSentError)
      }
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      throw error
    }

    return updatedInvitation
  }

  return {
    createInvitation,
    fetchInvitations,
    updateInvitationStatus,
    checkExpiredInvitations,
    deleteInvitation,
    resendInvitation, // Add the new function to the exports
    validateInvitation
  }
}