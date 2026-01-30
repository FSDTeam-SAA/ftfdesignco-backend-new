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
  validateRequest(userValidation.userValidationSchema),
  userController.registerUser,
)

router.post(
  "/verify-email",
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.verifyEmail
);


router.post(
  '/resend-otp',
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.resendOtpCode,
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
