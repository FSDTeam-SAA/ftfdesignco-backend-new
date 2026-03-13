import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IAddToCart } from './addToCart.interface'
import { AddToCart } from './addToCart.model'
import { Product } from '../product/product.model'

// Add product to cart
// const addToCart = async (payload: { userId: string; products: any[] }) => {
//   const productIds = payload.products.map((p) => p.productId);

const addToCart = async (payload: { userId: string; products: any[] }) => {
  // ── Step 1: Validate that every incoming productId actually exists in the DB ──
  const incomingIds = payload.products.map((p) => p.productId)
  const dbProducts = await Product.find({ _id: { $in: incomingIds } })

  if (dbProducts.length !== incomingIds.length) {
    throw new AppError('One or more products not found', StatusCodes.NOT_FOUND)
  }

  // ── Step 2: Load the existing cart for this user (may be null) ──
  const existingCart = await AddToCart.findOne({ userId: payload.userId })

  let mergedProducts: any[]

  if (existingCart) {
    // The user already has a cart → we must MERGE, not replace.
    //
    // Start with a copy of what's already in the cart.
    mergedProducts = [...existingCart.products.map((p: any) => p.toObject())]

    for (const incomingItem of payload.products) {
      const existingIndex = mergedProducts.findIndex(
        (m) =>
          m.productId.toString() === incomingItem.productId.toString() &&
          m.size === incomingItem.size,
      )

      if (existingIndex === -1) {
        mergedProducts.push(incomingItem)
      } else {
        mergedProducts[existingIndex].quantity += incomingItem.quantity
      }
    }
  } else {
    // No existing cart → the incoming products become the cart as-is.
    mergedProducts = payload.products
  }

  // ── Step 3: Recalculate totalPrice from the MERGED list ──
  const allProductIds = mergedProducts.map((item) => item.productId)
  const allDbProducts = await Product.find({ _id: { $in: allProductIds } })

  if (allDbProducts.length !== allProductIds.length) {
    throw new AppError('One or more products not found', StatusCodes.NOT_FOUND)
  }

  const priceMap = new Map(
    allDbProducts.map((p) => [p._id.toString(), p.price] as const),
  )

  const calculatedTotalPrice = mergedProducts.reduce((acc, item) => {
    const productPrice = priceMap.get(item.productId.toString()) ?? 0
    return acc + productPrice * item.quantity
  }, 0)

  // ── Step 4: Persist (upsert) the merged cart ──
  const result = await AddToCart.findOneAndUpdate(
    { userId: payload.userId },
    {
      $set: {
        products: mergedProducts,
        totalPrice: calculatedTotalPrice,
      },
    },
    { upsert: true, new: true, runValidators: true },
  ).populate({
    path: 'products.productId',
    select: 'images title price',
  })

  return result
}

// Get cart by user ID
const getCartByUserId = async (userId: string) => {
  const result = await AddToCart.findOne({ userId }).populate({
    path: 'products.productId',
    select: 'images title price',
  })

  if (!result) throw new AppError('Cart not found', StatusCodes.NOT_FOUND)

  // 1. Check for ghost products (population failed)
  const initialLength = result.products.length
  const validProducts = result.products.filter(
    (item) => item.productId !== null,
  )

  // 2. SELF-HEALING: If we found ghosts, fix the DB immediately
  if (validProducts.length !== initialLength) {
    const newTotal = validProducts.reduce(
      (acc, item: any) => acc + item.productId.price * item.quantity,
      0,
    )

    await AddToCart.updateOne(
      { _id: result._id },
      { $set: { products: validProducts, totalPrice: newTotal } },
    )

    console.log(
      `🧹 Cleaned ${initialLength - validProducts.length} ghost items from user cart.`,
    )

    // Assign cleaned values for the response
    result.products = validProducts as any
    ;(result as any).totalPrice = newTotal
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
