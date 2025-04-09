import { H3Event } from 'h3'
import { sendMail } from '../../utils/mailer'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const client = serverSupabaseServiceRole(event)
    const { invitation } = await readBody(event)
    
    // Format expiry date
    const expiryDate = new Date(invitation.expired_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Verify the invitation exists
    const { data: existingInvitation, error: invitationError } = await client
      .from('invitations')
      .select('*')
      .eq('email', invitation.email)
      .eq('role', invitation.role)
      .single()

    if (invitationError || !existingInvitation) {
      throw createError({
        statusCode: 404,
        message: 'Invitation not found'
      })
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3000'

    // Generate invitation URL with token and email
    const invitationUrl = `${baseUrl}/auth/invitation?token=${existingInvitation.token}&email=${encodeURIComponent(existingInvitation.email)}`

    // Determine which template to use based on role
    const template = invitation.role === 'STUDENT' ? 'student-invitation' : 'moderator-invitation'

    // Prepare email context
    const emailContext = {
      name: existingInvitation.name,
      role: existingInvitation.role.toLowerCase(),
      grade: existingInvitation.metadata?.grade ? String(existingInvitation.metadata.grade) : '',
      invitationUrl,
      expiryDate,
      currentYear: new Date().getFullYear().toString()
    }

    // Send email
    await sendMail({
      to: existingInvitation.email,
      subject: `Welcome to ScienceHub - ${existingInvitation.role === 'STUDENT' ? 'Student Invitation' : 'Join Our Teaching Team'}`,
      template,
      context: emailContext
    })
    
    const { error } = await client
      .from('invitations')
      .update({ is_mail_sent: true, invited_at: new Date() })
      .eq('id', existingInvitation.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Failed to send invitation:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to send invitation email'
    })
  }
})