import { Router } from 'express'
import orderController from './order.controller'

const router = Router()

router.post('/', orderController.createOrder)
router.get('/', orderController.getAllOrders)
router.get('/:id', orderController.getOrderById)
router.get('/user/:userId', orderController.getOrdersByUserId)
router.put('/:id', orderController.updateOrderStatus)
router.delete('/:id', orderController.deleteOrder)

export const orderRouter = router
