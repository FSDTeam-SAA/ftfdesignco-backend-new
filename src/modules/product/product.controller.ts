import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import productService from './product.service'

// Create a new product
const createProduct = catchAsync(async (req, res) => {
  const result = await productService.createProduct(req.body, req.file)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Product created successfully',
    data: result,
  })
})

// Get all products
const getAllProducts = catchAsync(async (req, res) => {
  const result = await productService.getAllProducts()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products retrieved successfully',
    data: result,
  })
})

// Get product by ID
const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await productService.getProductById(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product retrieved successfully',
    data: result,
  })
})

// Update product by ID
const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await productService.updateProduct(id, req.body, req.file)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  })
})

// Delete product by ID
const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await productService.deleteProduct(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  })
})

// Get products by type
const getProductsByType = catchAsync(async (req, res) => {
  const { type } = req.params
  const result = await productService.getProductsByType(type)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products retrieved successfully by type',
    data: result,
  })
})

// Get products by user/role
const getProductsByRole = catchAsync(async (req, res) => {
  const { roleId } = req.params
  const result = await productService.getProductsByRole(roleId)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Products retrieved successfully by user',
    data: result,
  })
})

const productController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByType,
  getProductsByRole,
}

export default productController
