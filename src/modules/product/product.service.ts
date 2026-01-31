import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../../utils/cloudinary'
import { IProduct } from './product.interface'
import { Product } from './product.model'

// Create a new product
const createProduct = async (
  payload: IProduct,
  file?: Express.Multer.File,
): Promise<IProduct> => {
  const existingProduct = await Product.isProductExistByTitle(payload.title)
  if (existingProduct) {
    throw new AppError(
      'Product with this title already exists',
      StatusCodes.CONFLICT,
    )
  }

  // Upload image to Cloudinary if file is provided
  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, 'products')
    payload.image = uploadResult.secure_url
  }

  const result = await Product.create(payload)
  return result
}



// Get all products
// const getAllProducts = async (): Promise<IProduct[]> => {
//   const result = await Product.find().populate(
//     'role',
//     'firstName lastName email',
//   )
//   return result
// }



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
  file?: Express.Multer.File,
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

  // Upload new image to Cloudinary if file is provided
  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, 'products')
    payload.image = uploadResult.secure_url

    // Delete old image from Cloudinary if it exists
    if (existingProduct.image) {
      const publicIdMatch = existingProduct.image.match(/\/products\/([^/]+)\.[^.]+$/);
      if (publicIdMatch) {
        const publicId = `products/${publicIdMatch[1]}`
        await deleteFromCloudinary(publicId).catch(() => {
          // Ignore errors if old image doesn't exist
        })
      }
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



// 1. Get Products by a specific Role ID (Direct Fetch)
const getProductsByRole = async (roleId: string): Promise<IProduct[]> => {
  // Use 'targetRoles' to match your schema logic
  const result = await Product.find({
    targetRoles: { $in: [roleId] },
    status: 'active'
  }).populate('targetRoles', 'roleTitle images');

  return result;
};

// 2. Get All Products (With Optional Role Filtering & Query handling)
const getAllProducts = async (query: Record<string, unknown>, roleId?: string) => {
  const filter: any = { status: 'active' };

  // If a roleId is provided (from the user's profile), we filter the catalog
  if (roleId) {
    filter.targetRoles = { $in: [roleId] };
  }

  // Combine this with your existing search/pagination logic
  const result = await Product.find(filter)
    .populate('targetRoles', 'roleTitle images');

  return result;
};

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
