import { z } from 'zod'

const authValidation = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
})

const adminResetPasswordValidation = z.object({
  body: z.object({
    userIds: z
      .array(
        z.string({
          required_error: 'Please select user to reset with default password.',
        }),
      )
      .min(1, 'Please select at least one user.'),
  }),
})

export const authValidationSchema = {
  authValidation,
  adminResetPasswordValidation,
}
