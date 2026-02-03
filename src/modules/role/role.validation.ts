import { z } from 'zod'

// role.validation.ts
const createRoleValidationSchema = z.object({
  body: z.object({
    roleTitle: z.string({
      required_error: 'Role title is required',
    }),
    images: z.string().optional(), 
  }),
});

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
