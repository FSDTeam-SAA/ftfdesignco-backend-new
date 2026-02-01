import { z } from 'zod'

const createOrderValidationSchema = z.object({
  body: z.object({
    user: z.string(), // The User ID
    region: z.string({ required_error: "Please enter your region" }),
    totalAmount: z.number().min(1),
    products: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      size: z.string()
    }))
  })
});

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
