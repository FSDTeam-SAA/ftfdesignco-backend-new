import { Model, Types } from 'mongoose'

export interface IAddToCart {
  _id?: string
  userId: Types.ObjectId
  products: Array<{
    productId: Types.ObjectId
    quantity: number
    size: string
    fit_cut: string
    fabric_material: string
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
  fit_cut: string;
  fabric_material: string;
}

export type addToCartModel = Model<IAddToCart> 
