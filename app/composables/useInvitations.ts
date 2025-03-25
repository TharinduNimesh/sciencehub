import type { Database, Invitation } from '~/types/supabase'

export const useInvitations = () => {
  const supabase = useSupabaseClient<Database>()
  const config = useRuntimeConfig()

  const getInvitationStatus = (invitation: Database['public']['Views']['invitation_details']['Row']): Invitation['status'] => {
    if (invitation.is_revoked) return 'Revoked'
    if (invitation.is_used) return 'Used'
    if (invitation.is_accepted === false) return 'Rejected'
    if (invitation.is_accepted === true) return 'Accepted'
    if (new Date(invitation.expired_at) < new Date()) return 'Expired'
    return 'Pending'
  }

  const validateInvitation = async (email: string) => {
    const { data: existingInvitation, error: fetchError } = await supabase
      .from('invitation_details')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (fetchError) throw fetchError
    if (existingInvitation) throw new Error('An invitation already exists for this email.')

    const { data: isUserRegistered, error: userCheckError } = await supabase
      .rpc('is_user_already_registered', { email_input: email.toLowerCase() })

    if (userCheckError) throw userCheckError
    if (isUserRegistered) throw new Error('A user already exists with this email.')
  }

  const fetchInvitations = async (role?: 'STUDENT' | 'MODERATOR'): Promise<Invitation[]> => {
    let query = supabase
      .from('invitation_details')
      .select('*')
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }

    const { data: invitations, error } = await query
    if (error) throw error

    return invitations.map(invitation => ({
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      ...(invitation.metadata?.grade ? { grade: invitation.metadata.grade } : {}),
      ...(invitation.metadata?.classes ? { classes: invitation.metadata.classes } : {}),
      invitedAt: invitation.invited_at,
      expiredAt: invitation.expired_at,
      invitedBy: invitation.invited_by_name ?? 'System',
      status: getInvitationStatus(invitation)
    }))
  }

  const createInvitation = async (data: {
    email: string
    name: string
    grade?: number
    classes?: Array<{ id: number; name: string }>
    expiresIn?: number
    role?: 'STUDENT' | 'MODERATOR'
  }) => {
    await validateInvitation(data.email)

    const metadata: Record<string, any> = {}
    if (data.role === 'STUDENT' && data.grade) {
      metadata.grade = data.grade
    } else if (data.role === 'MODERATOR' && data.classes) {
      metadata.classes = data.classes
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (data.expiresIn || 7))

    const { data: user } = await supabase.auth.getUser()
    const invited_by = user.user?.id

    const { data: newInvitation, error } = await supabase
      .from('invitations')
      .insert({
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role || 'STUDENT',
        metadata,
        expired_at: expiresAt.toISOString(),
        invited_by
      })
      .select('*')
      .single()

    if (error) throw error

    try {
      await sendInvitationEmail(newInvitation)
    } catch (error) {
      console.error('Failed to send invitation email:', error)
    }

    return newInvitation
  }

  const updateInvitationStatus = async (id: number) => {
    const { error } = await supabase
      .from('invitations')
      .update({ is_revoked: true })
      .eq('id', id)

    if (error) throw error
  }

  const deleteInvitation = async (id: number) => {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  const resendInvitation = async (id: number) => {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: invitation, error: fetchError } = await supabase
      .from('invitation_details')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError
    if (!invitation) throw new Error('Invitation not found')

    const { error: updateError } = await supabase
      .from('invitations')
      .update({
        expired_at: expiresAt.toISOString(),
        is_revoked: false,
        is_mail_sent: false,
        invited_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    try {
      await sendInvitationEmail(invitation)
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      throw error
    }

    return invitation
  }

  const sendInvitationEmail = async (invitation: Database['public']['Views']['invitation_details']['Row']) => {
    try {
      const { error } = await useFetch('/api/invitations/send', {
        method: 'POST',
        body: {
          invitation,
          baseUrl: config.public.appUrl
        }
      })

      if (error.value) throw error.value
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      throw error
    }
  }

  return {
    createInvitation,
    fetchInvitations,
    updateInvitationStatus,
    deleteInvitation,
    resendInvitation,
    validateInvitation
  }
}