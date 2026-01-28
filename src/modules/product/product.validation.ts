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
    availableQuantity: z.number({
      required_error: 'Available quantity is required',
    }),
    price: z.number({
      required_error: 'Price is required',
    }),
    role: z.string({
      required_error: 'Role (User ID) is required',
    }),
  }),
})

const updateProductValidationSchema = z.object({
  body: z.object({
    image: z.string().optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    size: z.string().optional(),
    availableQuantity: z.number().optional(),
    price: z.number().optional(),
    role: z.string().optional(),
  }),
})

export const productValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
}
