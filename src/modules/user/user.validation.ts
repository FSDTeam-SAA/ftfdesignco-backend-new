import { z } from 'zod'

const userValidationSchema = z.object({
  body: z.object({
    firstName: z.string({
      required_error: 'First name is required',
    }),
    lastName: z.string({
      required_error: 'Last name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    phoneNumber: z.string().optional(),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters'),
    homeAddress: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    role: z.enum(['owner', 'employer']).optional(),
    avatar: z.string().optional(),
    companyName: z.string().optional(),
    location: z.string().optional(),
  }),
})

const updateUserValidationSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    homeAddress: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    avatar: z.string().optional(),
    balance: z.number().optional(),
    companyName: z.string().optional(),
    location: z.string().optional(),
  }),
})

export const userValidation = {
  userValidationSchema,
  updateUserValidationSchema,
}
