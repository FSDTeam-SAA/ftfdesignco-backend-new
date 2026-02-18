import { Router } from "express";
import auth from "../../middleware/auth";
import { upload } from "../../middleware/multer.middleware";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "./user.constant";
import userController from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(userValidation.userValidationSchema),
  userController.registerUser,
);

router.post(
  "/employer-register",
  upload.single("file"),
  userController.addEmployee,
);

router.post(
  "/verify-email",
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.verifyEmail,
);

router.post(
  "/resend-otp",
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.resendOtpCode,
);

router.get("/all-users", userController.getAllUsers);

router.get(
  "/my-profile",
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.getMyProfile,
);


router.put(
  "/update-profile/:userID",
  upload.single("image"),
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.updateUserProfile,
);


router.get(
  "/admin_id",
  auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.getAdminId,
);

router.delete(
  "/delete/:id",
  // auth(USER_ROLE.OWNER, USER_ROLE.EMPLOYER),
  userController.deleteUser,
);

const userRouter = router;
export default userRouter;
