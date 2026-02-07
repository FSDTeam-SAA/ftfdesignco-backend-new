import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import userService from "./user.service";

const registerUser = catchAsync(async (req, res) => {
  const result = await userService.registerUser(req.body);
  const { accessToken, user } = result;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Account created successfully. Please verify your email.",
    data: {
      accessToken,
      user,
    },
  });
});

const addEmployee = catchAsync(async (req, res) => {
  let result;

  // ✅ CSV upload case
  if (req.file) {
    result = await userService.addEmployeeByCSV(req.file.path);
  }
  // ✅ Single employee JSON case
  else if (req.body?.email) {
    result = await userService.addEmployee(req.body);
  } else {
    throw new AppError("Invalid request", StatusCodes.BAD_REQUEST);
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Employee processed successfully",
    data: result,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await userService.verifyEmail(email, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Email verified successfully. You can now log in.",
    data: result,
  });
});

const resendOtpCode = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await userService.resendOtpCode(email);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "OTP code sent successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully.",
    data: result,
  });
});

const getAdminId = catchAsync(async (req, res) => {
  const result = await userService.getAdminId();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin ID fetched successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const { email } = req.user;

  const result = await userService.getMyProfile(email);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Your profile has been retrieved successfully.",
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await userService.updateUserProfile(req.body, email, req.file);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Your profile has been updated successfully.",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteUser(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Your account has been deleted successfully.",
    data: result,
  });
});

const userController = {
  registerUser,
  verifyEmail,
  resendOtpCode,
  getAllUsers,
  getMyProfile,
  updateUserProfile,
  getAdminId,
  addEmployee,
  deleteUser,
};

export default userController;
