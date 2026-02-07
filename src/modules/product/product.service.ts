import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../utils/cloudinary";
import { Order } from "../order/order.model";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";

// Create a new product
const createProduct = async (
  payload: IProduct,
  files?: Express.Multer.File[],
): Promise<IProduct> => {
  if (!files || files.length === 0) {
    throw new AppError("At least one image is required", StatusCodes.BAD_REQUEST);
  }

  // Parallel Upload
  const uploadResults = await Promise.all(
    files.map((file) => uploadToCloudinary(file.path, "products"))
  );

  // Map ALL results to the array
  payload.image = uploadResults.map((res) => ({
    url: res.secure_url,
    publicId: res.public_id,
  }));

  return await Product.create(payload);
};

// Get product by ID
const getProductById = async (id: string): Promise<IProduct | null> => {
  const product = await Product.isProductExistById(id);
  if (!product) {
    throw new AppError("Product not found", StatusCodes.NOT_FOUND);
  }

  const result = await Product.findById(id).populate(
    "role",
    "firstName lastName email",
  );
  return result;
};

// Update product by ID
const updateProduct = async (
  id: string,
  payload: Partial<IProduct>,
  files?: Express.Multer.File[],
): Promise<IProduct | null> => {
  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    throw new AppError("Product not found", StatusCodes.NOT_FOUND);
  }

  // Handle Image Update
  if (files && files.length > 0) {
    // 1. Upload new files
    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.path, "products"))
    );

    // 2. Prepare new images array
    payload.image = uploadResults.map((res) => ({
      url: res.secure_url,
      publicId: res.public_id,
    }));

    // 3. Delete OLD images from Cloudinary (Cleanup)
    if (existingProduct.image && existingProduct.image.length > 0) {
      const deletePromises = existingProduct.image.map((img) =>
        deleteFromCloudinary(img.publicId)
      );
      // We don't await this strictly to speed up response, 
      // but in Elite SWE, we use Promise.allSettled to ensure we try all.
      Promise.allSettled(deletePromises);
    }
  }

  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete product by ID
const deleteProduct = async (id: string): Promise<IProduct | null> => {
  const existingProduct = await Product.isProductExistById(id);
  if (!existingProduct) {
    throw new AppError("Product not found", StatusCodes.NOT_FOUND);
  }

  const result = await Product.findByIdAndDelete(id);
  return result;
};

// Get products by type
const getProductsByType = async (type: string): Promise<IProduct[]> => {
  const result = await Product.find({ type }).populate(
    "role",
    "firstName lastName email",
  );
  return result;
};

// 1. Get Products by a specific Role ID (Direct Fetch)
const getProductsByRole = async (roleId: string): Promise<IProduct[]> => {
  // Use 'targetRoles' to match your schema logic
  const result = await Product.find({
    targetRoles: { $in: [roleId] },
    status: "active",
  }).populate("targetRoles", "roleTitle images");

  return result;
};


// product.service.ts
const getAllProducts = async (
  query: Record<string, unknown>,
  roleId?: string,
) => {
  const filter: any = { status: "active" };

  if (roleId) {
    // Show products that match the role OR have no specific roles assigned (Global)
    filter.$or = [
      { targetRoles: { $in: [roleId] } },
      { targetRoles: { $size: 0 } },
    ];
  }

  return await Product.find(filter).populate("targetRoles");
};

const getAllProductInventories = async (page = 1, limit = 10) => {
  // Calculate skip
  const skip = (page - 1) * limit;

  // 1️⃣ Get paginated products
  const products = await Product.find({ status: "active" })
    .skip(skip)
    .limit(limit)
    .lean();

  // 2️⃣ Get total product count
  const totalProducts = await Product.countDocuments({ status: "active" });

  // 3️⃣ Map each product with total ordered quantity
  const productsWithOrderQuantity = await Promise.all(
    products.map(async (product) => {
      const orders = await Order.aggregate([
        { $unwind: "$products" },
        { $match: { "products.productId": product._id } },
        {
          $group: {
            _id: "$products.productId",
            totalOrderedQuantity: { $sum: "$products.quantity" },
          },
        },
      ]);

      const totalOrderedQuantity =
        orders.length > 0 ? orders[0].totalOrderedQuantity : 0;

      return {
        ...product,
        totalOrderedQuantity,
      };
    }),
  );

  return {
    data: productsWithOrderQuantity,
    meta: {
      total: totalProducts,
      page,
      limit,
      totalPage: Math.ceil(totalProducts / limit),
    },
  };
};

const productService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByType,
  getProductsByRole,
  getAllProductInventories,
};

export default productService;
