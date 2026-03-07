import { StatusCodes } from 'http-status-codes'
import AppError from '../../errors/AppError'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import userService from './user.service'
import { USER_ROLE } from './user.constant'

const registerUser = catchAsync(async (req, res) => {
  const result = await userService.registerUser(req.body)
  const { accessToken, user } = result

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Account created successfully.',
    data: {
      accessToken,
      user,
    },
  })
})

const addEmployee = catchAsync(async (req, res) => {
  let result

  // ✅ CSV upload case
  if (req.file) {
    result = await userService.addEmployeeByCSV(req.file.path)
  }
  // ✅ Single employee JSON case
  else if (req.body?.email) {
    result = await userService.addEmployee(req.body)
  } else {
    throw new AppError('Invalid request', StatusCodes.BAD_REQUEST)
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Employee processed successfully',
    data: result,
  })
})

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully.',
    data: result,
  })
})

const getAdminId = catchAsync(async (req, res) => {
  const result = await userService.getAdminId()

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin ID fetched successfully',
    data: result,
  })
})

const getMyProfile = catchAsync(async (req, res) => {
  const { email } = req.user

  const result = await userService.getMyProfile(email)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your profile has been retrieved successfully.',
    data: result,
  })
})

// const updateUserProfile = catchAsync(async (req, res) => {
//   const { email } = req.user
//   const result = await userService.updateUserProfile(req.body, email, req.file)

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: 'Your profile has been updated successfully.',
//     data: result,
//   })
// })

const updateUserProfile = catchAsync(async (req, res) => {
  const { userID } = req.params
  const requestor = req.user // Injected by auth middleware

  // 1. Authorization: Only OWNER or the profile owner (EMPLOYER) can update
  const isOwner = requestor.role === USER_ROLE.OWNER
  const isSelf = requestor.id === userID

  if (!isOwner && !isSelf) {
    throw new AppError(
      'Forbidden: You can only update your own profile.',
      StatusCodes.FORBIDDEN,
    )
  }

  // 2. Data Protection: Prevent EMPLOYERS from changing their own roles/status
  const updatePayload = { ...req.body }
  if (!isOwner) {
    delete updatePayload.role
    delete updatePayload.status
  }

  const result = await userService.updateUserProfile(
    userID as string,
    updatePayload,
    req.file,
  )

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully.',
    data: result,
  })
})

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params
  const result = await userService.deleteUser(id as string)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Your account has been deleted successfully.',
    data: result,
  })
})

const updateUserBalance = catchAsync(async (req, res) => {
  const { balance } = req.body

  if (balance === undefined || balance === null) {
    throw new AppError('Balance is required', StatusCodes.BAD_REQUEST)
  }

  const result = await userService.updateUserBalance(balance)

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All users balance updated successfully.',
    data: result,
  })
})

const userController = {
  registerUser,
  getAllUsers,
  getMyProfile,
  updateUserProfile,
  getAdminId,
  addEmployee,
  deleteUser,
  updateUserBalance,
}

export default userController
