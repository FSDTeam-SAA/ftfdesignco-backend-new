import { Model, Types } from 'mongoose'

export interface IProduct {
  _id?: string
  images: {
    url: string
    publicId: string
  }[]
  title: string
  type: string
  description: string
  size: string
  availableQuantity: number
  price: number
  targetRoles: Types.ObjectId[]
  status: 'active' | 'deactive'
  createdAt?: Date
  updatedAt?: Date
  rigion?: string 
}

export interface productModel extends Model<IProduct> {
  isProductExistById(_id: string): Promise<IProduct | null>
  isProductExistByTitle(title: string): Promise<IProduct | null>
}
