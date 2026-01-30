import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IAddToCart } from './addToCart.interface'
import { AddToCart } from './addToCart.model'

// Add product to cart
const addToCart = async (payload: IAddToCart): Promise<IAddToCart> => {
  const result = await AddToCart.create(payload)
  return result
}

// Get cart by user ID
const getCartByUserId = async (userId: string): Promise<IAddToCart | null> => {
  const result = await AddToCart.findOne({ userId }).populate(
    'products.productId',
  )
  if (!result) {
    throw new AppError('Cart not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Update cart
const updateCart = async (
  id: string,
  payload: Partial<IAddToCart>,
): Promise<IAddToCart | null> => {
  const result = await AddToCart.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('products.productId')

  if (!result) {
    throw new AppError('Cart not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Remove product from cart (remove entire cart)
const removeFromCart = async (id: string): Promise<IAddToCart | null> => {
  const result = await AddToCart.findByIdAndDelete(id)
  if (!result) {
    throw new AppError('Cart not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Clear cart (delete all items)
const clearCart = async (userId: string): Promise<{ deletedCount: number }> => {
  const result = await AddToCart.deleteOne({ userId })
  return { deletedCount: result.deletedCount }
}

const addToCartService = {
  addToCart,
  getCartByUserId,
  updateCart,
  removeFromCart,
  clearCart,
}

export default addToCartService
