import { Router } from 'express'
import auth from '../../middleware/auth'
import { upload } from '../../middleware/multer.middleware'
import validateRequest from '../../middleware/validateRequest'
import { USER_ROLE } from '../user/user.constant'
import roleController from './role.controller'
import { roleValidation } from './role.validation'

const router = Router()

router.post(
  '/create-role',
  auth(USER_ROLE.OWNER),
  upload.single('images'), // 'file' is the key in form-data
  validateRequest(roleValidation.createRoleValidationSchema),
  roleController.createRole,
)

router.get(
  '/',
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  roleController.getAllRoles,
)

router.get('/:id', roleController.getRoleById)
router.put(
  '/:id',
  auth(USER_ROLE.OWNER),
  upload.single('images'),
  validateRequest(roleValidation.updateRoleValidationSchema),
  roleController.updateRole,
)
router.delete('/:id', roleController.deleteRole)

router.patch(
  '/select-role',
  auth(USER_ROLE.EMPLOYER, USER_ROLE.OWNER), // Ensure user is logged in
  roleController.setUserRole,
)

const roleRouter = router
export default roleRouter
