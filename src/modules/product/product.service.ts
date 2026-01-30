import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IProduct } from './product.interface'
import { Product } from './product.model'

// Create a new product
const createProduct = async (payload: IProduct): Promise<IProduct> => {
  const existingProduct = await Product.isProductExistByTitle(payload.title)
  if (existingProduct) {
    throw new AppError(
      'Product with this title already exists',
      StatusCodes.CONFLICT,
    )
  }

  const result = await Product.create(payload)
  return result
}

// Get all products
const getAllProducts = async (): Promise<IProduct[]> => {
  const result = await Product.find().populate(
    'role',
    'firstName lastName email',
  )
  return result
}

// Get product by ID
const getProductById = async (id: string): Promise<IProduct | null> => {
  const product = await Product.isProductExistById(id)
  if (!product) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND)
  }

  const result = await Product.findById(id).populate(
    'role',
    'firstName lastName email',
  )
  return result
}

// Update product by ID
const updateProduct = async (
  id: string,
  payload: Partial<IProduct>,
): Promise<IProduct | null> => {
  const existingProduct = await Product.isProductExistById(id)
  if (!existingProduct) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND)
  }

  // Check if title is being updated and already exists
  if (payload.title && payload.title !== existingProduct.title) {
    const titleExists = await Product.isProductExistByTitle(payload.title)
    if (titleExists) {
      throw new AppError(
        'Product with this title already exists',
        StatusCodes.CONFLICT,
      )
    }
  }

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('role', 'firstName lastName email')

  return result
}

// Delete product by ID
const deleteProduct = async (id: string): Promise<IProduct | null> => {
  const existingProduct = await Product.isProductExistById(id)
  if (!existingProduct) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND)
  }

  const result = await Product.findByIdAndDelete(id)
  return result
}

// Get products by type
const getProductsByType = async (type: string): Promise<IProduct[]> => {
  const result = await Product.find({ type }).populate(
    'role',
    'firstName lastName email',
  )
  return result
}

// Get products by user/role
const getProductsByRole = async (roleId: string): Promise<IProduct[]> => {
  const result = await Product.find({ role: roleId }).populate(
    'role',
    'firstName lastName email',
  )
  return result
}

const productService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByType,
  getProductsByRole,
}

export default productService
