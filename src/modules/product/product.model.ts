import { model, Schema } from 'mongoose'
import { IProduct, productModel } from './product.interface'

const productSchema = new Schema<IProduct, productModel>(
  {
    // product.model.ts
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRoles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role', // Points to your Role collection, not User
        required: true,
      }
    ],
    status: {
      type: String,
      enum: ['active', 'deactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Static method to check if product exists by ID
productSchema.static(
  'isProductExistById',
  async function (id: string): Promise<IProduct | null> {
    return await Product.findById(id)
  },
)

// Static method to check if product exists by title
productSchema.static(
  'isProductExistByTitle',
  async function (title: string): Promise<IProduct | null> {
    return await Product.findOne({ title })
  },
)

export const Product = model<IProduct, productModel>('Product', productSchema)
