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

interface IPopulatedProduct {
  _id: string;
  title: string;
  price: number;
  images: { url: string }[];
}

interface ICartItem {
  productId: IPopulatedProduct;
  quantity: number;
  size: string;
}

export type addToCartModel = Model<IAddToCart> 
