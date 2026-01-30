import { Model, Types } from 'mongoose'

export interface IAddToCart {
  _id?: string
  userId: Types.ObjectId
  products: Array<{
    productId: Types.ObjectId
    quantity: number
    size: string
  }>
  totalPrice: number
  createdAt?: Date
  updatedAt?: Date
}

export interface addToCartModel extends Model<IAddToCart> {}
