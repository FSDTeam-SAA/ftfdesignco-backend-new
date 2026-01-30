import { z } from 'zod'

const createRoleValidationSchema = z.object({
  body: z.object({
    images: z.string({
      required_error: 'Images is required',
    }),
    roleTitle: z.string({
      required_error: 'Role title is required',
    }),
  }),
})

const updateRoleValidationSchema = z.object({
  body: z.object({
    images: z.string().optional(),
    roleTitle: z.string().optional(),
  }),
})

export const roleValidation = {
  createRoleValidationSchema,
  updateRoleValidationSchema,
}
