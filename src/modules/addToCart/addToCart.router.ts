import { Router } from 'express'
import addToCartController from './addToCart.controller'

const router = Router()

router.post('/', addToCartController.addToCart)
router.get('/:userId', addToCartController.getCartByUserId)
router.put('/:id', addToCartController.updateCart)
router.delete('/:id', addToCartController.removeFromCart)
router.delete('/clear/:userId', addToCartController.clearCart)

export const addToCartRouter = router
