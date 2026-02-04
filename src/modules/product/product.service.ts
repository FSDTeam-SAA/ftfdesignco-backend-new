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
  files?: Express.Multer.File[],
): Promise<IProduct> => {
  const existingProduct = await Product.isProductExistByTitle(payload.title)
  if (existingProduct) {
    throw new AppError(
      'Product with this title already exists',
      StatusCodes.CONFLICT,
    )
  }

  // 1. Check if files exist since schema marks images as required
  if (!files || files.length === 0) {
    throw new AppError('Product images are required', StatusCodes.BAD_REQUEST)
  }

  // 2. Upload all images to Cloudinary
  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const uploadResult = await uploadToCloudinary(file.path, 'products')
      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      }
    }),
  )

  // 3. Map to the NEW schema structure (Array of objects)
  payload.images = uploadedImages

  // 4. Create the product
  const result = await Product.create(payload)
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
  files?: Express.Multer.File[],
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

  // Upload new images to Cloudinary if files are provided
  if (files && files.length > 0) {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await uploadToCloudinary(file.path, 'products')
        return {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        }
      }),
    )

    payload.images = uploadedImages

    // Delete old images from Cloudinary if they exist
    if (existingProduct.images && Array.isArray(existingProduct.images)) {
      await Promise.all(
        existingProduct.images.map(async (image) => {
          if (image.publicId) {
            await deleteFromCloudinary(image.publicId).catch(() => {
              // Ignore errors if old image doesn't exist
            })
          }
        }),
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

// 1. Get Products by a specific Role ID (Direct Fetch)
const getProductsByRole = async (roleId: string): Promise<IProduct[]> => {
  // Use 'targetRoles' to match your schema logic
  const result = await Product.find({
    targetRoles: { $in: [roleId] },
    status: 'active',
  }).populate('targetRoles', 'roleTitle images')

  return result
}

// 2. Get All Products (With Optional Role Filtering & Query handling)
// const getAllProducts = async (query: Record<string, unknown>, roleId?: string) => {
//   const filter: any = { status: 'active' };

//   // If a roleId is provided (from the user's profile), we filter the catalog
//   if (roleId) {
//     filter.targetRoles = { $in: [roleId] };
//   }

//   // Combine this with your existing search/pagination logic
//   const result = await Product.find(filter)
//     .populate('targetRoles', 'roleTitle images');

//   return result;
// };

// product.service.ts
const getAllProducts = async (
  query: Record<string, unknown>,
  roleId?: string,
) => {
  const filter: any = { status: 'active' }

  if (roleId) {
    // Show products that match the role OR have no specific roles assigned (Global)
    filter.$or = [
      { targetRoles: { $in: [roleId] } },
      { targetRoles: { $size: 0 } },
    ]
  }

  return await Product.find(filter).populate('targetRoles')
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
