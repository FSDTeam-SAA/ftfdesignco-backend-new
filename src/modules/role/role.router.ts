import { Router } from 'express'
import roleController from './role.controller'

const router = Router()

router.post('/', roleController.createRole)
router.get('/', roleController.getAllRoles)
router.get('/:id', roleController.getRoleById)
router.put('/:id', roleController.updateRole)
router.delete('/:id', roleController.deleteRole)

export const roleRouter = router
