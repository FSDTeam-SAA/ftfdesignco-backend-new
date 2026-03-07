import csv from 'csv-parser'
import fs from 'fs'
import { StatusCodes } from 'http-status-codes'
import config from '../../config'
import AppError from '../../errors/AppError'
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../../utils/cloudinary'
import { createToken } from '../../utils/tokenGenerate'
import { Order } from '../order/order.model'
import { Role } from '../role/role.model'
import { IUser } from './user.interface'
import { User } from './user.model'

const registerUser = async (payload: IUser) => {
  const existingUser = await User.isUserExistByEmail(payload.email)
  if (existingUser) {
    throw new AppError('User already exists', StatusCodes.CONFLICT)
  }

  // Password check
  if (payload.password.length < 6) {
    throw new AppError(
      'Password must be at least 6 characters long',
      StatusCodes.BAD_REQUEST,
    )
  }

  const result = await User.create({
    ...payload,
    isVerified: true,
    otp: null,
    otpExpires: null,
  })

  // JWT payload
  const JwtToken = {
    userId: result._id,
    email: result.email,
    role: result.role,
  }

  const accessToken = createToken(
    JwtToken,
    config.JWT_SECRET as string,
    config.JWT_EXPIRES_IN as string,
  )

  const refreshToken = createToken(
    JwtToken,
    config.refreshTokenSecret as string,
    config.jwtRefreshTokenExpiresIn as string,
  )

  return {
    accessToken,
    refreshToken,
    user: {
      _id: result._id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
    },
  }
}

const getAllUsers = async (query: Record<string, unknown>) => {
  const { searchTerm, roleTitle } = query as {
    searchTerm?: string
    roleTitle?: string
  }

  const filter: Record<string, unknown> = {}

  if (searchTerm) {
    filter.$or = [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ]
  }

  if (roleTitle) {
    const roles = await Role.find({
      roleTitle: { $regex: roleTitle, $options: 'i' },
    }).select('_id')

    const roleIds = roles.map((role) => role._id)
    if (roleIds.length === 0) return []

    filter.role_id = { $in: roleIds }
  }

  const result = await User.find(filter)
    .populate('role_id', 'roleTitle')
    .select(
      '-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires',
    )
  return result
}

const getAdminId = async () => {
  const admin = await User.findOne({ role: 'admin' }).select('_id')
  return admin
}

const getMyProfile = async (email: string) => {
  const existingUser = await User.findOne({ email })
  if (!existingUser)
    throw new AppError(
      'No account found with the provided credentials.',
      StatusCodes.NOT_FOUND,
    )

  const result = await User.findOne({ email }).select(
    '-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires',
  )

  return result
}

const updateUserProfile = async (id: string, payload: any, file: any) => {
  const user = await User.findById(id).select('avatar')
  if (!user) throw new AppError('User not found', StatusCodes.NOT_FOUND)

  let newAvatarUrl: string | undefined

  try {
    if (file) {
      // 1. Upload new image
      const uploadResult = await uploadToCloudinary(file.path, 'users')
      newAvatarUrl = uploadResult.secure_url
      payload.avatar = newAvatarUrl
    }

    // 2. Database Update
    const result = await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).select('-password -otp -otpExpires')

    // 3. Success: Cleanup OLD avatar if it exists
    if (file && user.avatar) {
      const publicId = user.avatar.split('/').pop()?.split('.')[0]
      if (publicId) await deleteFromCloudinary(`users/${publicId}`)
    }

    return result
  } catch (error) {
    // 4. Rollback: If DB update fails, delete the NEW image we just uploaded
    if (newAvatarUrl) {
      const newPublicId = newAvatarUrl.split('/').pop()?.split('.')[0]
      if (newPublicId) await deleteFromCloudinary(`users/${newPublicId}`)
    }
    throw error
  }
}

const addEmployee = async (payload: IUser) => {
  const existingUser = await User.findOne({ email: payload.email })
  if (existingUser) {
    throw new AppError('Employee already exists', 409)
  }

  const defaultPassword = '123456'

  const employee = await User.create({
    ...payload,
    password: payload.password ? payload.password : defaultPassword,
    isVerified: true,
    otp: null,
    otpExpires: null,
    role: 'employer',
  })

  return employee
}

const addEmployeeByCSV = async (filePath: string) => {
  const rows: any[] = []

  // 1️⃣ Parse CSV
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject)
  })

  let success = 0
  let failed = 0
  const errors: any[] = []

  // 2️⃣ Process rows
  for (const row of rows) {
    try {
      // 🔹 Email check
      if (!row.email || row.email.trim() === '') {
        throw new Error(
          `Email missing for ${row.firstName || ''} ${row.lastName || ''}`,
        )
      }

      // 🔹 Duplicate email check
      const existingUser = await User.findOne({ email: row.email })
      if (existingUser) {
        throw new Error(`User already exists: ${row.email}`)
      }

      // 🔹 Default password if missing
      if (!row.password || row.password.trim() === '') {
        row.password = '123456' // default password
      }

      await addEmployee(row) // reuse single employee logic
      success++
    } catch (err: any) {
      failed++
      errors.push({
        email: row.email || `${row.firstName || ''} ${row.lastName || ''}`,
        reason: err.message,
      })
    }
  }

  // 3️⃣ Optional: delete CSV after processing
  fs.unlinkSync(filePath)

  return {
    total: rows.length,
    success,
    failed,
    errors,
  }
}

const deleteUser = async (id: string) => {
  // 1️⃣ Find the user
  const user = await User.findById(id)
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND)
  }

  // 2️⃣ Check if user has any active orders (not delivered)
  const activeOrdersCount = await Order.countDocuments({
    user: user._id,
    status: { $ne: 'delivered' }, // status != delivered
  })

  if (activeOrdersCount > 0) {
    throw new AppError(
      'Cannot delete user. User has orders that are not delivered.',
      StatusCodes.BAD_REQUEST,
    )
  }

  // 3️⃣ Safe to delete user
  await User.deleteOne({ _id: user._id })
}

const updateUserBalance = async (balance: number) => {
  // 1️⃣ Validate balance
  if (typeof balance !== 'number' || balance < 0) {
    throw new AppError(
      'Balance must be a non-negative number',
      StatusCodes.BAD_REQUEST,
    )
  }

  // 2️⃣ Update all users' balance
  const result = await User.updateMany(
    {},
    { balance },
    {
      runValidators: true,
    },
  )

  if (!result.modifiedCount || result.modifiedCount === 0) {
    throw new AppError('No users found to update', StatusCodes.NOT_FOUND)
  }

  // 3️⃣ Return updated users list
  const updatedUsers = await User.find({}).select(
    '-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires',
  )

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
    users: updatedUsers,
  }
}

const userService = {
  registerUser,
  getAllUsers,
  getMyProfile,
  updateUserProfile,
  getAdminId,
  addEmployee,
  addEmployeeByCSV,
  deleteUser,
  updateUserBalance,
}

export default userService
