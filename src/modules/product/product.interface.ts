import { Model, Types } from 'mongoose'

export interface IProduct {
  _id?: string
  image: string
  title: string
  type: string
  description: string
  size: string
  availableQuantity: number
  price: number
  role: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

export interface productModel extends Model<IProduct> {
  isProductExistById(_id: string): Promise<IProduct | null>
  isProductExistByTitle(title: string): Promise<IProduct | null>
}
