import { Router } from 'express'
import userController from './user.controller'
import validateRequest from '../../middleware/validateRequest'
import { userValidation } from './user.validation'
import auth from '../../middleware/auth'
import { USER_ROLE } from './user.constant'
import { upload } from '../../middleware/multer.middleware'

const router = Router()

router.post(
  '/register',
  upload.single('image'),
  validateRequest(userValidation.userValidationSchema),
  userController.registerUser,
)

router.get('/all-users', userController.getAllUsers)
router.get(
  '/my-profile',
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.getMyProfile,
)

router.put(
  '/update-profile',
  upload.single('image'),
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.updateUserProfile,
)

router.get(
  '/admin_id',
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.getAdminId,
)

const userRouter = router
export default userRouter
