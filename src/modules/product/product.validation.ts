import { z } from 'zod'

const createProductValidationSchema = z.object({
  body: z.object({
    image: z.string({
      required_error: 'Image is required',
    }),
    title: z.string({
      required_error: 'Title is required',
    }),
    type: z.string({
      required_error: 'Type is required',
    }),
    description: z.string({
      required_error: 'Description is required',
    }),
    size: z.string({
      required_error: 'Size is required',
    }),
    availableQuantity: z
      .number({
        required_error: 'Available quantity is required',
      })
      .min(0, 'Available quantity must be at least 0'),
    price: z
      .number({
        required_error: 'Price is required',
      })
      .min(0, 'Price must be at least 0'),
    role: z.string({
      required_error: 'Role (User ID) is required',
    }),
    status: z.enum(['active', 'deactive']).optional(),
  }),
})

const updateProductValidationSchema = z.object({
  body: z.object({
    image: z.string().optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    size: z.string().optional(),
    availableQuantity: z
      .number()
      .min(0, 'Available quantity must be at least 0')
      .optional(),
    price: z.number().min(0, 'Price must be at least 0').optional(),
    role: z.string().optional(),
    status: z.enum(['active', 'deactive']).optional(),
  }),
})

export const productValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
}
