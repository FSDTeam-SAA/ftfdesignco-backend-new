import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import validateRequest from "../../middleware/validateRequest";
import productController from "./product.controller";
import { productValidation } from "./product.validation";

const router = Router();

// Create product
router.post(
  "/create",
  upload.array("image", 5), // Changed from .single("image")
  validateRequest(productValidation.createProductValidationSchema),
  productController.createProduct,
);

// Get all products
router.get("/all", productController.getAllProducts);

// Get all product inventories
router.get("/inventories", productController.getAllProductInventories);

// Get product by ID
router.get("/:id", productController.getProductById);

// Get products by type
router.get("/type/:type", productController.getProductsByType);

// Get products by user/role
router.get("/user/:roleId", productController.getProductsByRole);

// Update product by ID
router.put(
  "/:id",
  upload.array("image", 5), // Match the field name here too
  validateRequest(productValidation.updateProductValidationSchema),
  productController.updateProduct,
);

// Delete product by ID
router.delete("/:id", productController.deleteProduct);

const productRouter = router;
export default productRouter;
