import { model, Schema, Types } from 'mongoose'
import { IOrder, orderModel } from './order.interface'

const orderSchema = new Schema<IOrder, orderModel>(
  {

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    remainingBalance: { type: Number, required: true },
    region: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'paid', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Order = model<IOrder, orderModel>('Order', orderSchema)
