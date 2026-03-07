import { Model, Types } from 'mongoose'

export interface IOrder {
  _id?: string
  user: Types.ObjectId
  totalAmount: number
  remainingBalance: number
  region: string
  products: Array<{
    productId: Types.ObjectId
    quantity: number
    size: string
  }>
  status: 'new' | 'inprogress' | 'shipped/complete'
  createdAt?: Date
  updatedAt?: Date
}

export type orderModel = Model<IOrder>
