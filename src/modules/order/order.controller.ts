import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import orderService from './order.service'

// Create a new order
const createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrder(req.body)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order created successfully',
    data: result,
  })
})

// Get all orders
const getAllOrders = catchAsync(async (req, res) => {
  const result = await orderService.getAllOrders()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: result,
  })
})

// Get order by ID
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await orderService.getOrderById(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  })
})

// Get orders by user ID
const getOrdersByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params
  const result = await orderService.getOrdersByUserId(userId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: result,
  })
})

// Update order status
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await orderService.updateOrderStatus(id, req.body)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  })
})

// Delete order by ID
const deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await orderService.deleteOrder(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order deleted successfully',
    data: result,
  })
})

const orderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
}

export default orderController
