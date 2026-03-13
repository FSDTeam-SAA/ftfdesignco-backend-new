import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import addToCartService from './addToCart.service'

// Add product to cart
const addToCart = catchAsync(async (req, res) => {
  const userId = req.user.id

  const result = await addToCartService.addToCart({
    userId,
    products: req.body.products,
  })

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product added to cart successfully',
    data: result,
  })
})

// Get cart by user ID
const getCartByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params
  const result = await addToCartService.getCartByUserId(userId as string)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart retrieved successfully',
    data: result,
  })
})

// Update cart
const updateCart = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await addToCartService.updateCart(id as string, req.body)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart updated successfully',
    data: result,
  })
})

// Remove product from cart
const removeFromCart = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await addToCartService.removeFromCart(id as string)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product removed from cart successfully',
    data: result,
  })
})

// Clear cart
const clearCart = catchAsync(async (req, res) => {
  const { userId } = req.params
  const result = await addToCartService.clearCart(userId as string)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Cart cleared successfully',
    data: result,
  })
})



const addToCartController = {
  addToCart,
  getCartByUserId,
  updateCart,
  removeFromCart,
  clearCart,
}

export default addToCartController
