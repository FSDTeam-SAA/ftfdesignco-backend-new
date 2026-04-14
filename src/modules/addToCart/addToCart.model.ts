import { model, Schema } from 'mongoose'
import { IAddToCart, addToCartModel } from './addToCart.interface'

const addToCartSchema = new Schema<IAddToCart, addToCartModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
        fit_cut: {
          type: String,
        },
        fabric_material: {
          type: String,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const AddToCart = model<IAddToCart, addToCartModel>(
  'AddToCart',
  addToCartSchema,
)
