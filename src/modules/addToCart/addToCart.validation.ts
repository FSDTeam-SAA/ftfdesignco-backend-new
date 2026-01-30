import { z } from 'zod'

const addToCartValidationSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User ID is required',
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
    totalPrice: z
      .number({
        required_error: 'Total price is required',
      })
      .min(0, 'Total price must be at least 0'),
  }),
})

const updateCartValidationSchema = z.object({
  body: z.object({
    products: z
      .array(
        z.object({
          productId: z.string().optional(),
          quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
          size: z.string().optional(),
        }),
      )
      .optional(),
    totalPrice: z.number().min(0, 'Total price must be at least 0').optional(),
  }),
})

export const addToCartValidation = {
  addToCartValidationSchema,
  updateCartValidationSchema,
}
