import { z } from 'zod';
import { serverSupabaseServiceRole } from '#supabase/server'

// Schema for sign up request validation
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  token: z.string().uuid()
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Validate request body
    const { email, password, token } = signUpSchema.parse(body);
    
    const supabase = serverSupabaseServiceRole(event);
    
    // Get invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('*, invitation_status(*)')
      .eq('token', token)
      .single();

    if (invitationError || !invitation) {
      throw createError({
        statusCode: 400,
        message: 'Invalid invitation token'
      });
    }

    // Validate invitation
    if (invitation.is_revoked) {
      throw createError({
        statusCode: 400,
        message: 'Invitation has been revoked'
      });
    }

    if (invitation.expired_at < new Date().toISOString()) {
      throw createError({
        statusCode: 400,
        message: 'Invitation has expired'
      });
    }

    if (invitation.invitation_status.is_used) {
      throw createError({
        statusCode: 400,
        message: 'Invitation has already been used'
      });
    }

    if (invitation.email !== email) {
      throw createError({
        statusCode: 400,
        message: 'Email does not match invitation'
      });
    }

    // Create user with Supabase
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (userError) {
      throw createError({
        statusCode: 400,
        message: userError.message
      });
    }

    return {
      message: 'User created successfully',
      user: userData.user
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input',
        data: error.errors
      });
    }
    throw error;
  }
});