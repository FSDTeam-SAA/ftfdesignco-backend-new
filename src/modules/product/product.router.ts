import { Router } from 'express'
import productController from './product.controller'
import validateRequest from '../../middleware/validateRequest'
import { productValidation } from './product.validation'
import { upload } from '../../middleware/multer.middleware'

const router = Router()

// Create product
router.post(
  '/create',
  upload.single('image'),
  validateRequest(productValidation.createProductValidationSchema),
  productController.createProduct,
)

// Get all products
router.get('/all', productController.getAllProducts)

// Get product by ID
router.get('/:id', productController.getProductById)

// Get products by type
router.get('/type/:type', productController.getProductsByType)

// Get products by user/role
router.get('/user/:roleId', productController.getProductsByRole)

// Update product by ID
router.put(
  '/:id',
  upload.single('image'),
  validateRequest(productValidation.updateProductValidationSchema),
  productController.updateProduct,
)

// Delete product by ID
router.delete('/:id', productController.deleteProduct)

const productRouter = router
export default productRouter
