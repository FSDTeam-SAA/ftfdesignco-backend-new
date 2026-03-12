import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IOrder } from './order.interface'
import { Order } from './order.model'
import { User } from '../user/user.model'
import mongoose from 'mongoose'
import { Product } from '../product/product.model'
import { AddToCart } from '../addToCart/addToCart.model'

// Create a new order
const createOrder = async (payload: any) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = await User.findById(payload.user).session(session)
    if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND)

    let calculatedTotalAmount = 0
    const productsToUpdate = []

    // 1. Calculate Real Price and Check Stock
    for (const item of payload.products) {
      const product = await Product.findById(item.productId).session(session)
      if (!product)
        throw new AppError('Product not found', StatusCodes.NOT_FOUND)

      if (product.availableQuantity < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.title}`,
          StatusCodes.CONFLICT,
        )
      }

      calculatedTotalAmount += product.price * item.quantity
      product.availableQuantity -= item.quantity
      productsToUpdate.push(product)
    }

    // 2. DYNAMIC STATUS & BALANCE LOGIC
    let orderStatus = 'new'
    let finalRemainingBalance = user.balance

    if (user.balance >= calculatedTotalAmount) {
      // User has enough money -> Pay immediately
      user.balance -= calculatedTotalAmount
      finalRemainingBalance = user.balance
      orderStatus = 'inprogress'
      await user.save({ session })
    } else {
      // Insufficient balance -> Order stays 'new' (User pays later/Admin collects)
      orderStatus = 'new'
    }

    // 3. Save Products (Stock is reserved regardless of payment status)
    for (const p of productsToUpdate) {
      await p.save({ session })
    }

    // 4. Create Order Record
    const orderData = {
      ...payload,
      totalAmount: calculatedTotalAmount,
      remainingBalance: finalRemainingBalance,
      status: orderStatus, // Automatically set to 'paid' or 'pending'
    }

    const [newOrder] = await Order.create([orderData], { session })

    // Clear the user's cart after successful order creation
    await AddToCart.deleteOne({ userId: payload.user }).session(session)

    await session.commitTransaction()
    // return newOrder;
    return await newOrder.populate('user', 'firstName lastName email')
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const getAllOrders = async (query: Record<string, any>) => {
  const { searchTerm, sort, page = 1, limit = 10, region } = query
  const skip = (Number(page) - 1) * Number(limit)
  const sortDirection = sort === 'role_desc' ? -1 : 1

  const pipeline: any[] = [
    // 1. Join with Users
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

    // 2. Join with Roles via user.selectedRole
    {
      $lookup: {
        from: 'roles',
        localField: 'user.selectedRole',
        foreignField: '_id',
        as: 'selectedRoleDetails',
      },
    },
    {
      $unwind: {
        path: '$selectedRoleDetails',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 3. Filter by region if provided
    ...(region
      ? [
        {
          $match: {
            region: { $regex: region, $options: 'i' },
          },
        },
      ]
      : []),

    // 4. Search logic (User Fields + Order Fields)
    {
      $match: searchTerm
        ? {
          $or: [
            { 'user.firstName': { $regex: searchTerm, $options: 'i' } },
            { 'user.email': { $regex: searchTerm, $options: 'i' } },
            { region: { $regex: searchTerm, $options: 'i' } },
            {
              'selectedRoleDetails.roleTitle': {
                $regex: searchTerm,
                $options: 'i',
              },
            },
          ],
        }
        : {},
    },

    // 4. Facet for Pagination and Metadata
    {
      $facet: {
        meta: [{ $count: 'total' }],
        data: [
          // Sorting
          {
            $sort:
              sort === 'role'
                ? { 'selectedRoleDetails.roleTitle': sortDirection }
                : { createdAt: -1 },
          },
          { $skip: skip },
          { $limit: Number(limit) },
          // 5. SECURITY: Project out sensitive fields
          {
            $project: {
              'user.password': 0,
              'user.otp': 0,
              'user.resetPasswordOtp': 0,
              'user.resetPasswordOtpExpires': 0,
            },
          },
        ],
      },
    },
  ]

  const result = await Order.aggregate(pipeline)
  const total = result[0].meta[0]?.total || 0

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: result[0].data,
  }
}

// Get order by ID
const getOrderById = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findById(id)
    .populate('user', 'firstName lastName email phoneNumber region homeAddress') // Changed from userId to user
    .populate('products.productId', 'title price image')

  if (!result) {
    throw new AppError('Order not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Get orders by user ID
const getOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
  // We query by 'user' because that is the field name in your Model
  const result = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email region')
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

const getMyPaymentHistoryFromDB = async (userId: string): Promise<IOrder[]> => {
  console.log('Searching history for User ID:', userId)

  const history = await Order.find({
    user: userId,
    status: 'inprogress', // Only show orders in progress
  })
    .sort({ createdAt: -1 }) // Newest first
    .populate('products.productId', 'title price') // Show product details

  return history
}

const getOrderForUserIDFromDB = async (userId: string): Promise<IOrder[]> => {
  console.log('Searching history for User ID:', userId)

  const history = await Order.find({
    user: userId,
  })
    .sort({ createdAt: -1 }) // Newest first
    .populate('products.productId', 'title price') // Show product details

  return history
}

const orderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
  getMyPaymentHistoryFromDB,
  getOrderForUserIDFromDB,
}

export default orderService
