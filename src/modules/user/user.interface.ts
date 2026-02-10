import { Model, Types } from 'mongoose'
import { USER_ROLE } from './user.constant'

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  homeAddress?: string;
  city?: string;
  region?: string;
  role: "owner" | "employer";
  image?: {
    url?: string;
    publicId?: string;
  };
  balance: number;
  selectedRole?: Types.ObjectId;
  companyName?: string;
  location?: string;
  role_id?: Types.ObjectId;
  resetPasswordOtp?: string | null;
  resetPasswordOtpExpires?: Date | null;
  isVerified?: boolean;
  otp?: string | null;
  otpExpires?: Date | null;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface userModel extends Model<IUser> {
  isPasswordMatch(password: string, hashedPassword: string): Promise<boolean>
  isUserExistByEmail(email: string): Promise<IUser | null>
  isUserExistById(_id: string): Promise<IUser | null>
}

export type TUserRole = keyof typeof USER_ROLE
