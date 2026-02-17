import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IAddToCart } from './addToCart.interface'
import { AddToCart } from './addToCart.model'
import { Product } from '../product/product.model';
import mongoose from 'mongoose';

// Add product to cart
// const addToCart = async (payload: { userId: string; products: any[] }) => {
//   const productIds = payload.products.map((p) => p.productId);

//   // 1. Fetch real product data from DB
//   const dbProducts = await Product.find({ _id: { $in: productIds } });

//   if (dbProducts.length !== productIds.length) {
//     throw new AppError('One or more products not found', StatusCodes.NOT_FOUND);
//   }

//   // 2. CALCULATE: Add this block right here
//   const calculatedTotalPrice = dbProducts.reduce((acc, p) => {
//     const item = payload.products.find(
//       (item) => item.productId.toString() === p._id.toString()
//     );
//     return acc + p.price * (item?.quantity || 0);
//   }, 0);

//   // 3. CREATE: Use the calculated price
//   const result = await AddToCart.create({
//     ...payload,
//     totalPrice: calculatedTotalPrice,
//   });

//   // 4. POPULATE: Return with images for the frontend
//   return await AddToCart.findById(result._id).populate({
//     path: 'products.productId',
//     select: 'images title price',
//   });
// };

const addToCart = async (payload: { userId: string; products: any[] }) => {
  try {
    const productIds = payload.products.map((p) => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== productIds.length) {
      throw new AppError('One or more products not found', StatusCodes.NOT_FOUND);
    }

    const calculatedTotalPrice = dbProducts.reduce((acc, p) => {
      const item = payload.products.find(
        (i) => i.productId.toString() === p._id.toString()
      );
      return acc + p.price * (item?.quantity || 0);
    }, 0);

    // Perform the Upsert
    const result = await AddToCart.findOneAndUpdate(
      { userId: payload.userId },
      { 
        $set: { 
          products: payload.products, 
          totalPrice: calculatedTotalPrice 
        } 
      },
      { 
        upsert: true, 
        new: true, 
        runValidators: true 
      }
    ).populate({
      path: 'products.productId',
      select: 'images title price',
    });

    console.log("✅ CART_PERSISTED_SUCCESSFULLY:", result?._id);
    return result;
  } catch (error) {
    console.error("❌ MONGODB_SAVE_ERROR:", error);
    throw error;
  }
};


// Get cart by user ID
const getCartByUserId = async (userId: string) => {
  const result = await AddToCart.findOne({ userId }).populate({
    path: 'products.productId',
    select: 'images title price',
  });

  if (!result) throw new AppError('Cart not found', StatusCodes.NOT_FOUND);

  // 1. Check for ghost products (population failed)
  const initialLength = result.products.length;
  const validProducts = result.products.filter(item => item.productId !== null);

  // 2. SELF-HEALING: If we found ghosts, fix the DB immediately
  if (validProducts.length !== initialLength) {
    const newTotal = validProducts.reduce((acc, item: any) => 
      acc + (item.productId.price * item.quantity), 0
    );
    
    await AddToCart.updateOne(
      { _id: result._id },
      { $set: { products: validProducts, totalPrice: newTotal } }
    );
    
    console.log(`🧹 Cleaned ${initialLength - validProducts.length} ghost items from user cart.`);
    
    // Assign cleaned values for the response
    result.products = validProducts as any;
    (result as any).totalPrice = newTotal;
  }

  return result;
};

// Update cart
const updateCart = async (
  id: string,
  payload: Partial<IAddToCart>,
): Promise<IAddToCart | null> => {
  const result = await AddToCart.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('products.productId')

  if (!result) {
    throw new AppError('Cart not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Remove product from cart (remove entire cart)
const removeFromCart = async (id: string): Promise<IAddToCart | null> => {
  const result = await AddToCart.findByIdAndDelete(id)
  if (!result) {
    throw new AppError('Cart not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Clear cart (delete all items)
const clearCart = async (userId: string): Promise<{ deletedCount: number }> => {
  const result = await AddToCart.deleteOne({ userId })
  return { deletedCount: result.deletedCount }
}



const addToCartService = {
  addToCart,
  getCartByUserId,
  updateCart,
  removeFromCart,
  clearCart,

}

export default addToCartService
