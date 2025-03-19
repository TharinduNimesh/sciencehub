import { z } from 'zod'
import { emailSchema, nameSchema, phoneSchema } from './common'

export const signInSchema = z.object({
    email: emailSchema,
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .max(100, 'Password is too long'),
    rememberMe: z.boolean().optional()
})

export const joinFormSchema = z.object({
    fullName: nameSchema,
    email: emailSchema,
    contactNumber: phoneSchema,
    grade: z.number()
        .min(6, 'Grade must be between 6 and 11')
        .max(11, 'Grade must be between 6 and 11'),
    referralSource: z.string()
        .min(1, 'Please select how you found us')
})