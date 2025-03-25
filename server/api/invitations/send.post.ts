import { H3Event } from 'h3'
import { sendMail } from '../../utils/mailer'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const client = serverSupabaseServiceRole(event)
    const { invitation, baseUrl } = await readBody(event)
    
    // Format expiry date
    const expiryDate = new Date(invitation.expired_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Generate invitation URL with token and email
    const invitationUrl = `${baseUrl}/auth/invitation?token=${invitation.token}&email=${encodeURIComponent(invitation.email)}`
    
    // Get logo URL
    const logoUrl = `${baseUrl}/images/logo.svg`

    // Determine which template to use based on role
    const template = invitation.role === 'STUDENT' ? 'student-invitation' : 'moderator-invitation'

    // Prepare email context
    const emailContext = {
      name: invitation.name,
      role: invitation.role.toLowerCase(),
      grade: invitation.metadata?.grade ? String(invitation.metadata.grade) : '',
      invitationUrl,
      logoUrl,
      expiryDate,
      currentYear: new Date().getFullYear().toString()
    }

    // Send email
    await sendMail({
      to: invitation.email,
      subject: `Welcome to ScienceHub - ${invitation.role === 'STUDENT' ? 'Student Invitation' : 'Join Our Teaching Team'}`,
      template,
      context: emailContext
    })
    
    const { error } = await client
      .from('invitations')
      .update({ is_mail_sent: true })
      .eq('id', invitation.id)

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