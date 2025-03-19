import { z } from 'zod'

export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')

export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number is too long')
  .regex(/^[+\d\s-]+$/, 'Please enter a valid phone number')