import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IOrder } from './order.interface'
import { Order } from './order.model'

// Create a new order
const createOrder = async (payload: IOrder): Promise<IOrder> => {
  const result = await Order.create(payload)
  return result
}

// Get all orders
const getAllOrders = async (): Promise<IOrder[]> => {
  const result = await Order.find()
    .populate('userId', 'firstName lastName email')
    .populate('products.productId', 'title price')
  return result
}

// Get order by ID
const getOrderById = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findById(id)
    .populate('userId', 'firstName lastName email')
    .populate('products.productId', 'title price')
  if (!result) {
    throw new AppError('Order not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Get orders by user ID
const getOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
  const result = await Order.find({ userId })
    .populate('userId', 'firstName lastName email')
    .populate('products.productId', 'title price')
  return result
}

// Update order status
const updateOrderStatus = async (
  id: string,
  payload: Partial<IOrder>,
): Promise<IOrder | null> => {
  const result = await Order.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate('userId', 'firstName lastName email')
    .populate('products.productId', 'title price')

  if (!result) {
    throw new AppError('Order not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Delete order by ID
const deleteOrder = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findByIdAndDelete(id)
  if (!result) {
    throw new AppError('Order not found', StatusCodes.NOT_FOUND)
  }
  return result
}

const orderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
}

export default orderService
