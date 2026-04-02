import { model, Schema } from 'mongoose'
import { IProduct, ProductModel } from './product.interface'

const productSchema = new Schema<IProduct, ProductModel>(
  {
    // product.model.ts
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
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
    fit_cut: {
      type: String,
      required: true,
    },
    fabric_material: {
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
    targetRoles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role', // Points to your Role collection, not User
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'deactive'],
      default: 'active',
    },
    rigion: [
      {
        type: String,
        required: true,
      },
    ],
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

export const Product = model<IProduct, ProductModel>('Product', productSchema)
