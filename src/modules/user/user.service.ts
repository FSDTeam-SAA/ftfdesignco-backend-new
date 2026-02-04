import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import config from '../../config'
import AppError from '../../errors/AppError'
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from '../../utils/cloudinary'
import sendEmail from '../../utils/sendEmail'
import { createToken } from '../../utils/tokenGenerate'
import verificationCodeTemplate from '../../utils/verificationCodeTemplate'
import { IUser } from './user.interface'
import { User } from './user.model'

const registerUser = async (payload: IUser, file?: any) => {
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

  const userData: any = { ...payload }

  // Handle image upload if file is provided
  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, 'users')
    userData.image = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    }
  }

  const result = await User.create(userData)

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

const getAllUsers = async () => {
  const result = await User.find().select(
    'username firstName lastName email role',
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

const updateUserProfile = async (payload: any, email: string, file: any) => {
  const user = await User.findOne({ email }).select('image')
  if (!user)
    throw new AppError(
      'No account found with the provided credentials.',
      StatusCodes.NOT_FOUND,
    )

  // eslint-disable-next-line prefer-const
  let updateData: any = { ...payload }
  let oldImagePublicId: string | undefined

  if (file) {
    const uploadResult = await uploadToCloudinary(file.path, 'users')
    oldImagePublicId = user.image?.publicId

    updateData.image = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    }
  }

  const result = await User.findOneAndUpdate({ email }, updateData, {
    new: true,
  }).select('-password')

  if (file && oldImagePublicId) {
    await deleteFromCloudinary(oldImagePublicId)
  }

  return result
}

const userService = {
  registerUser,
  getAllUsers,
  getMyProfile,
  updateUserProfile,
  getAdminId,
}

export default userService
