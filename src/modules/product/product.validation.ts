import { z } from 'zod'

const createProductValidationSchema = z.object({
  body: z.object({
    images: z
      .array(
        z.object({
          url: z.string(),
          publicId: z.string(),
        }),
      )
      .optional(),
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
    fit_cut: z.string({
      required_error: 'Fit cut is required',
    }),
    fabric_material: z.string({
      required_error: 'Fabric material is required',
    }),
    availableQuantity: z.coerce
      .number({
        required_error: 'Available quantity is required',
      })
      .min(0, 'Available quantity must be at least 0'),
    targetRoles: z.preprocess(
      (val) => {
        if (typeof val === 'string') return [val]
        if (Array.isArray(val)) return val
        return []
      },
      z
        .array(z.string({ required_error: 'At least one Role ID is required' }))
        .min(1, 'At least one Role ID is required'),
    ),
    price: z.coerce
      .number({
        required_error: 'Price is required',
      })
      .min(0, 'Price must be at least 0'),
    status: z.enum(['active', 'deactive']).optional(),
    rigion: z.preprocess(
      (val) => {
        if (typeof val === 'string') return [val]
        if (Array.isArray(val)) return val
        return []
      },
      z
        .array(z.string({ required_error: 'At least one rigion is required' }))
        .min(1, 'At least one rigion is required'),
    ),
  }),
})

const updateProductValidationSchema = z.object({
  body: z.object({
    images: z
      .array(
        z.object({
          url: z.string(),
          publicId: z.string(),
        }),
      )
      .optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    size: z.string().optional(),
    fit_cut: z.string().optional(),
    fabric_material: z.string().optional(),
    availableQuantity: z.coerce
      .number()
      .min(0, 'Available quantity must be at least 0')
      .optional(),
    price: z.coerce.number().min(0, 'Price must be at least 0').optional(),
    targetRoles: z.preprocess((val) => {
      if (typeof val === 'string') return [val]
      if (Array.isArray(val)) return val
      return []
    }, z.array(z.string()).optional()),
    status: z.enum(['active', 'deactive']).optional(),
    rigion: z.preprocess((val) => {
      if (typeof val === 'string') return [val]
      if (Array.isArray(val)) return val
      return []
    }, z.array(z.string()).optional()),
  }),
})

export const productValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
}
