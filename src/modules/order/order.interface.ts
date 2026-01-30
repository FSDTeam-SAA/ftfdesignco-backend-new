import { Model, Types } from 'mongoose'

export interface IOrder {
  _id?: string
  userId: Types.ObjectId
  region: string
  products: Array<{
    productId: Types.ObjectId
    quantity: number
    size: string
  }>
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  createdAt?: Date
  updatedAt?: Date
}

export interface orderModel extends Model<IOrder> {}
