import { Router } from 'express'
import roleController from './role.controller'
import auth from '../../middleware/auth'
import { USER_ROLE } from '../user/user.constant'

const router = Router()

router.post('/', roleController.createRole)
router.get('/', roleController.getAllRoles)
router.get('/:id', roleController.getRoleById)
router.put('/:id', roleController.updateRole)
router.delete('/:id', roleController.deleteRole)



router.patch(
    '/select-role',
    auth(USER_ROLE.EMPLOYER, USER_ROLE.OWNER), // Ensure user is logged in
    roleController.setUserRole
);

export const roleRouter = router
