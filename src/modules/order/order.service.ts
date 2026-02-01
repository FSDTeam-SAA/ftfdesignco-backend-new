import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IOrder } from './order.interface'
import { Order } from './order.model'
import { User } from '../user/user.model';
import mongoose from 'mongoose';
import { Product } from '../product/product.model';

// Create a new order
const createOrder = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(payload.user).session(session);
    if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND);

    let calculatedTotalAmount = 0;
    const productsToUpdate = [];

    // 1. Calculate Real Price and Check Stock
    for (const item of payload.products) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new AppError('Product not found', StatusCodes.NOT_FOUND);

      if (product.availableQuantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.title}`, StatusCodes.CONFLICT);
      }

      calculatedTotalAmount += product.price * item.quantity;
      product.availableQuantity -= item.quantity;
      productsToUpdate.push(product);
    }

    // 2. DYNAMIC STATUS & BALANCE LOGIC
    let orderStatus = 'pending';
    let finalRemainingBalance = user.balance;

    if (user.balance >= calculatedTotalAmount) {
      // User has enough money -> Pay immediately
      user.balance -= calculatedTotalAmount;
      finalRemainingBalance = user.balance;
      orderStatus = 'paid';
      await user.save({ session });
    } else {
      // Insufficient balance -> Order stays 'pending' (User pays later/Admin collects)
      orderStatus = 'pending';
    }

    // 3. Save Products (Stock is reserved regardless of payment status)
    for (const p of productsToUpdate) {
      await p.save({ session });
    }

    // 4. Create Order Record
    const orderData = {
      ...payload,
      totalAmount: calculatedTotalAmount,
      remainingBalance: finalRemainingBalance,
      status: orderStatus, // Automatically set to 'paid' or 'pending'
    };

    const [newOrder] = await Order.create([orderData], { session });

    await session.commitTransaction();
    return newOrder;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get all orders with pagination
const getAllOrders = async (query: Record<string, unknown>) => {
  // 1. Set defaults for page and limit
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // 2. Fetch paginated data
  const result = await Order.find()
    .sort({ createdAt: -1 }) // Newest orders first
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName email phoneNumber') // Updated from userId
    .populate('products.productId', 'title price image');

  // 3. Count total documents for frontend math
  const total = await Order.countDocuments();
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: result,
  };
};

// Get order by ID
const getOrderById = async (id: string): Promise<IOrder | null> => {
  const result = await Order.findById(id)
    .populate('user', 'firstName lastName email phoneNumber region homeAddress') // Changed from userId to user
    .populate('products.productId', 'title price image');

  if (!result) {
    throw new AppError('Order not found', StatusCodes.NOT_FOUND);
  }
  return result;
};

// Get orders by user ID
const getOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
  // We query by 'user' because that is the field name in your Model
  const result = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email region')
    .populate('products.productId', 'title price');

  return result;
};

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
  console.log("Searching history for User ID:", userId);

  const history = await Order.find({
    user: userId,
    status: 'paid' // Only show successful payments
  })
    .sort({ createdAt: -1 }) // Newest first
    .populate('products.productId', 'title price'); // Show product details

  return history;
};




const orderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
  getMyPaymentHistoryFromDB,

}

export default orderService
