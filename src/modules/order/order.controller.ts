import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import orderService from './order.service'
import AppError from '../../errors/AppError'

// Create a new order
const createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrder(req.body)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Payment successful',
    data: result,
  })
})

// Get all orders

const getAllOrders = catchAsync(async (req, res) => {
  // Passing req.query allows the service to see ?page= and ?limit=
  const result = await orderService.getAllOrders(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully',
    meta: result.meta, // Include pagination info here
    data: result.data,
  });
});

// Get order by ID
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderService.getOrderById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: result,
  });
});

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

const getMyHistory = catchAsync(async (req, res) => {
  // 1. Debug: See what is actually inside the token
  console.log("Full req.user object:", req.user); 

  // 2. Try to get the ID from common keys
  const userId = req.user?._id || req.user?.id || req.user?.userId;

  if (!userId) {
     throw new AppError("User identity not found in token", StatusCodes.UNAUTHORIZED);
  }

  const result = await orderService.getMyPaymentHistoryFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});





const orderController = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
  getMyHistory,
  
}

export default orderController
