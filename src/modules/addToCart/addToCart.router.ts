import { Router } from 'express'
import addToCartController from './addToCart.controller'
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router()

router.post(
    '/',
    auth(USER_ROLE.EMPLOYER),
    addToCartController.addToCart);

router.get(
    '/:userId',
    auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
    addToCartController.getCartByUserId);


router.put(
    '/:id',
    auth(USER_ROLE.EMPLOYER),
    addToCartController.updateCart);

router.delete(
    '/:id',
    auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
    addToCartController.removeFromCart);

router.delete(
    '/clear/:userId',
    auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
    addToCartController.clearCart)

export const addToCartRouter = router
