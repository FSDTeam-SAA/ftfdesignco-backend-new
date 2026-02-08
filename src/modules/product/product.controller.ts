import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import productService from "./product.service";

// Create a new product
const createProduct = catchAsync(async (req, res) => {
  const result = await productService.createProduct(req.body, req.files as Express.Multer.File[]);


  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});


const getAllProducts = catchAsync(async (req, res) => {
  // Use optional chaining (?.) to prevent crashing if user is undefined
  const roleId = req.user?.selectedRole;

  const result = await productService.getAllProducts(req.query, roleId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

// Get product by ID
const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.getProductById(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

// Update product by ID
const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Cast req.files to the correct Multer Array type
  const files = req.files as Express.Multer.File[];

  const result = await productService.updateProduct(id as string, req.body, files);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

// Delete product by ID
const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.deleteProduct(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

// Get products by type
const getProductsByType = catchAsync(async (req, res) => {
  const { type } = req.params;
  const result = await productService.getProductsByType(type as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products retrieved successfully by type",
    data: result,
  });
});

// Get products by user/role
const getProductsByRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const result = await productService.getProductsByRole(roleId as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Products retrieved successfully by user",
    data: result,
  });
});

const getAllProductInventories = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await productService.getAllProductInventories(page, limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Product inventories retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const productController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByType,
  getProductsByRole,
  getAllProductInventories,
};

export default productController;
