import { Router } from 'express'
import orderController from './order.controller'
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router()

router.post(
    '/',

    orderController.createOrder);


router.get(
    '/get-all',
    auth(USER_ROLE.OWNER),
    orderController.getAllOrders);


router.get(
    '/:id',
    auth(USER_ROLE.OWNER),
    orderController.getOrderById);


router.get(
    '/user/:userId',
    auth(USER_ROLE.OWNER),
    orderController.getOrdersByUserId);


router.put(
    '/:id',
    orderController.updateOrderStatus);


router.delete(
    '/:id',
    auth(USER_ROLE.OWNER),
    orderController.deleteOrder);


router.get(
    '/:user/my-history',
    auth(USER_ROLE.EMPLOYER),
    orderController.getMyHistory
);




export const orderRouter = router
