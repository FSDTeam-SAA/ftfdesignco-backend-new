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
  const { searchTerm, price, availableQuantity, roleTitle } = query

  // If roleTitle filter is provided, use aggregation pipeline
  if (roleTitle) {
    const pipeline: any[] = [
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleData',
        },
      },
      {
        $match: {
          'roleData.roleTitle': { $regex: roleTitle, $options: 'i' },
        },
      },
    ]

    // Add other filters
    if (searchTerm) {
      pipeline.push({
        $match: { title: { $regex: searchTerm, $options: 'i' } },
      })
    }

    if (price) {
      pipeline.push({ $match: { price: Number(price) } })
    }

    if (availableQuantity) {
      pipeline.push({
        $match: { availableQuantity: Number(availableQuantity) },
      })
    }

    // Replace role with populated data
    pipeline.push({
      $addFields: {
        role: { $arrayElemAt: ['$roleData', 0] },
      },
    })

    pipeline.push({
      $project: {
        roleData: 0,
      },
    })

    return await Product.aggregate(pipeline)
  }

  // Original logic when roleTitle is not provided
  const filter: any = { $and: [{ status: 'active' }] }

  // 3. ADD SEARCH: Title (Partial Match)
  if (searchTerm) {
    filter.$and.push({
      title: { $regex: searchTerm, $options: 'i' },
    })
  }

  // 4. ADD SEARCH: Price (Exact Match)
  if (price) {
    filter.$and.push({ price: Number(price) })
  }

  // 5. ADD SEARCH: Available Quantity (Exact Match)
  if (availableQuantity) {
    filter.$and.push({ availableQuantity: Number(availableQuantity) })
  }

  return await Product.find(filter).populate('role', 'roleTitle')
}

const getAllProductInventories = async (
  page = 1,
  limit = 10,
  searchTerm = '',
) => {
  const skip = (page - 1) * limit

  // 1. Build dynamic search filter
  const query: any = { status: 'active' }
  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { type: { $regex: searchTerm, $options: 'i' } },
    ]
  }

  // 2. Single Aggregation Pipeline (No Maps/Loops)
  const result = await Product.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'orders', // Ensure this matches your Order collection name
        let: { productId: '$_id' },
        pipeline: [
          { $unwind: '$products' },
          {
            $match: { $expr: { $eq: ['$products.productId', '$$productId'] } },
          },
          { $group: { _id: null, total: { $sum: '$products.quantity' } } },
        ],
        as: 'orderStats',
      },
    },
    {
      $addFields: {
        totalOrderedQuantity: {
          $ifNull: [{ $arrayElemAt: ['$orderStats.total', 0] }, 0],
        },
      },
    },
    { $project: { orderStats: 0 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ])

  const data = result[0]?.data || []
  const totalProducts = result[0]?.totalCount[0]?.count || 0

  return {
    data,
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
