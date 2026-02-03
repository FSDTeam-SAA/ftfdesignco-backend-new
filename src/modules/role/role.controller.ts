import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import roleService from './role.service'
import { uploadToCloudinary } from '../../utils/cloudinary';
import AppError from '../../errors/AppError';

// Create a new role
// role.controller.ts
const createRole = catchAsync(async (req, res) => {
  // 1. Manual guard for the file
  if (!req.file) {
    throw new AppError('Role image file is required', StatusCodes.BAD_REQUEST);
  }

  // 2. Upload to Cloudinary
  const uploadResult = await uploadToCloudinary(req.file.path, 'roles');

  // 3. Create the role with the NEW URL
  const result = await roleService.createRole({
    ...req.body,
    images: uploadResult.secure_url,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Role created successfully',
    data: result,
  });
});

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

const setUserRole = catchAsync(async (req, res) => {
  const userId = req.user.id; // Assuming your auth middleware attaches user to req
  const { roleId } = req.body;

  const result = await roleService.setUserRoleFromDB(userId, roleId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User job role updated successfully',
    data: result,
  });
});

const roleController = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  setUserRole
}

export default roleController
