import { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const client = serverSupabaseServiceRole(event)
    const { email, token } = await readBody(event)

    // Validate required fields
    if (!email || !token) {
      throw createError({
        statusCode: 400,
        message: 'Email and token are required'
      })
    }

    // Fetch invitation with its status
    const { data: invitation, error: invitationError } = await client
      .from('invitations')
      .select(`
        *,
        invitation_status (
          is_accepted,
          is_used,
          used_at
        )
      `)
      .eq('email', email)
      .eq('token', token)
      .single()

    if (invitationError) {
      console.error('Error fetching invitation:', invitationError)
      throw createError({
        statusCode: 404,
        message: 'Invalid invitation'
      })
    }

    if (!invitation) {
      throw createError({
        statusCode: 404,
        message: 'Invitation not found'
      })
    }

    // Check if invitation is revoked
    if (invitation.is_revoked) {
      throw createError({
        statusCode: 400,
        message: 'This invitation has been revoked'
      })
    }

    // Check if invitation has expired
    if (new Date(invitation.expired_at) < new Date()) {
      throw createError({
        statusCode: 400,
        message: 'This invitation has expired'
      })
    }

    // Check if invitation has already been used
    if (invitation.invitation_status?.is_used) {
      throw createError({
        statusCode: 400,
        message: 'This invitation has already been used'
      })
    }

    // Check if invitation has already been accepted
    if (invitation.invitation_status?.is_accepted) {
      throw createError({
        statusCode: 400,
        message: 'This invitation has already been accepted'
      })
    }

    // Return success with invitation details
    return {
      success: true,
      invitation: {
        id: invitation.id,
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        metadata: invitation.metadata,
        expiredAt: invitation.expired_at
      }
    }

  } catch (error: any) {
    // If error is already formatted (from createError), rethrow it
    if (error.statusCode) {
      throw error
    }

    // Otherwise create a generic error
    console.error('Verification error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to verify invitation'
    })
  }
})