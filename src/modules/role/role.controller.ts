import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import roleService from './role.service'

// Create a new role
const createRole = catchAsync(async (req, res) => {
  const result = await roleService.createRole(req.body)

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Role created successfully',
    data: result,
  })
})

// Get all roles
const getAllRoles = catchAsync(async (req, res) => {
  const result = await roleService.getAllRoles()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Roles retrieved successfully',
    data: result,
  })
})

// Get role by ID
const getRoleById = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await roleService.getRoleById(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Role retrieved successfully',
    data: result,
  })
})

// Update role by ID
const updateRole = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await roleService.updateRole(id, req.body)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Role updated successfully',
    data: result,
  })
})

// Delete role by ID
const deleteRole = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await roleService.deleteRole(id)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Role deleted successfully',
    data: result,
  })
})

const roleController = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
}

export default roleController
