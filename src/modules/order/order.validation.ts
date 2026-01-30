import { z } from 'zod'

const createOrderValidationSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
    region: z.string({
      required_error: 'Region is required',
    }),
    products: z.array(
      z.object({
        productId: z.string({
          required_error: 'Product ID is required',
        }),
        quantity: z
          .number({
            required_error: 'Quantity is required',
          })
          .min(1, 'Quantity must be at least 1'),
        size: z.string({
          required_error: 'Size is required',
        }),
      }),
    ),
    status: z
      .enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
      .optional(),
  }),
})

const updateOrderValidationSchema = z.object({
  body: z.object({
    region: z.string().optional(),
    products: z
      .array(
        z.object({
          productId: z.string().optional(),
          quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
          size: z.string().optional(),
        }),
      )
      .optional(),
    status: z
      .enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
      .optional(),
  }),
})

export const orderValidation = {
  createOrderValidationSchema,
  updateOrderValidationSchema,
}
