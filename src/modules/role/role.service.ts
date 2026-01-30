import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import { IRole } from './role.interface'
import { Role } from './role.model'

// Create a new role
const createRole = async (payload: IRole): Promise<IRole> => {
  const existingRole = await Role.findOne({ roleTitle: payload.roleTitle })
  if (existingRole) {
    throw new AppError(
      'Role with this title already exists',
      StatusCodes.CONFLICT,
    )
  }

  const result = await Role.create(payload)
  return result
}

// Get all roles
const getAllRoles = async (): Promise<IRole[]> => {
  const result = await Role.find()
  return result
}

// Get role by ID
const getRoleById = async (id: string): Promise<IRole | null> => {
  const result = await Role.findById(id)
  if (!result) {
    throw new AppError('Role not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Update role by ID
const updateRole = async (
  id: string,
  payload: Partial<IRole>,
): Promise<IRole | null> => {
  // Check if roleTitle is being updated and already exists
  if (payload.roleTitle) {
    const existingRole = await Role.findOne({ roleTitle: payload.roleTitle })
    if (existingRole && existingRole._id.toString() !== id) {
      throw new AppError(
        'Role with this title already exists',
        StatusCodes.CONFLICT,
      )
    }
  }

  const result = await Role.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })

  if (!result) {
    throw new AppError('Role not found', StatusCodes.NOT_FOUND)
  }
  return result
}

// Delete role by ID
const deleteRole = async (id: string): Promise<IRole | null> => {
  const result = await Role.findByIdAndDelete(id)
  if (!result) {
    throw new AppError('Role not found', StatusCodes.NOT_FOUND)
  }
  return result
}

const roleService = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
}

export default roleService
