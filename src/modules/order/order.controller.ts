import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import orderService from "./order.service";

// Create a new order
const createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrder(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Payment successful",
    data: result,
  });
});

// Get all orders

// const getAllOrders = catchAsync(async (req, res) => {
//   // Passing req.query allows the service to see ?page= and ?limit=
//   const result = await orderService.getAllOrders(req.query);

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: "Orders retrieved successfully",
//     meta: result.meta, // Include pagination info here
//     data: result.data,
//   });
// });


const getAllOrders = catchAsync(async (req, res) => {
  // ELITE: Use req.validated.query
  const result = await orderService.getAllOrders(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Orders retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});



// Get order by ID
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderService.getOrderById(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});

// Get orders by user ID
const getOrdersByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await orderService.getOrdersByUserId(userId as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

// Update order status
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderService.updateOrderStatus(id as string, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

// Delete order by ID
const deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderService.deleteOrder(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order deleted successfully",
    data: result,
  });
});

const getMyHistory = catchAsync(async (req, res) => {
  const { userId } = req.user;

  if (!userId) {
    throw new AppError(
      "User identity not found in token",
      StatusCodes.UNAUTHORIZED,
    );
  }

  const result = await orderService.getMyPaymentHistoryFromDB(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment history retrieved successfully",
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
};

export default orderController;
