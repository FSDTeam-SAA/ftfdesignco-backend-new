import { promises as fs } from 'node:fs'
import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../../utils/cloudinary'
import { Order } from '../order/order.model'
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

  // 5. Delete images from the uploads folder
  await Promise.all(
    files.map(async (file) => {
      await fs.unlink(file.path).catch((err) => {
        console.error(`Error deleting file: ${file.path}`, err)
      })
    }),
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
  files?: Express.Multer.File[],
): Promise<IProduct | null> => {
  const existingProduct = await Product.findById(id)
  if (!existingProduct)
    throw new AppError('Product not found', StatusCodes.NOT_FOUND)

  if (files && files.length > 0) {
    // 1. Upload new batch
    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.path, 'products')),
    )

    // 2. Set new image array in payload
    payload.images = uploadResults.map((res) => ({
      url: res.secure_url,
      publicId: res.public_id,
    }))

    // 3. Cleanup: Trigger deletion of old images
    if (existingProduct.images && existingProduct.images.length > 0) {
      const deletePromises = existingProduct.images.map((img) =>
        deleteFromCloudinary(img.publicId),
      )
      // Fire and forget, or use Promise.allSettled if you need logs
      Promise.allSettled(deletePromises)
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
  })

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
    role: { $in: [roleId] },
    status: 'active',
  }).populate('role', 'roleTitle images')

  return result
}

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

const getAllProductInventories = async (page = 1, limit = 10) => {
  // Calculate skip
  const skip = (page - 1) * limit

  // 1️⃣ Get paginated products
  const products = await Product.find({ status: 'active' })
    .skip(skip)
    .limit(limit)
    .lean()

  // 2️⃣ Get total product count
  const totalProducts = await Product.countDocuments({ status: 'active' })

  // 3️⃣ Map each product with total ordered quantity
  const productsWithOrderQuantity = await Promise.all(
    products.map(async (product) => {
      const orders = await Order.aggregate([
        { $unwind: '$products' },
        { $match: { 'products.productId': product._id } },
        {
          $group: {
            _id: '$products.productId',
            totalOrderedQuantity: { $sum: '$products.quantity' },
          },
        },
      ])

      const totalOrderedQuantity =
        orders.length > 0 ? orders[0].totalOrderedQuantity : 0

      return {
        ...product,
        totalOrderedQuantity,
      }
    }),
  )

  return {
    data: productsWithOrderQuantity,
    meta: {
      total: totalProducts,
      page,
      limit,
      totalPage: Math.ceil(totalProducts / limit),
    },
  }
}

const getRigionProducts = async (
  page: number,
  limit: number,
  productRigion: string,
) => {
  // Calculate skip
  const skip = (page - 1) * limit

  // 1️⃣ Get paginated products
  const products = await Product.find({ rigion: productRigion })
    .skip(skip)
    .limit(limit)
    .lean()

  return {
    products,
  }
}

const productService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByType,
  getProductsByRole,
  getAllProductInventories,
  getRigionProducts,
}

export default productService
