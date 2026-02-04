import bcrypt from 'bcrypt'
import { model, Schema } from 'mongoose'
import config from '../../config'
import { applyEncryption } from '../../middleware/encryptionMiddleware'
import { IUser, userModel } from './user.interface'

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    homeAddress: {
      type: String,
    },
    city: {
      type: String,
    },
    region: {
      type: String,
    },
    selectedRole: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
    },
    role: {
      type: String,
      enum: ['owner', 'employer'],
      default: 'owner',
    },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    balance: {
      type: Number,
      default: 0,
    },
    companyName: {
      type: String,
    },
    location: {
      type: String,
    },
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordOtpExpires: {
      type: Date,
      default: null,
    },
    role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

userSchema.pre('save', async function (this: IUser, next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds),
  )

  next()
})

userSchema.post('save', function (doc: IUser, next) {
  doc.password = ''
  next()
})

userSchema.statics.isPasswordMatch = async function (
  password: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(password, hashedPassword)
}

userSchema.statics.isUserExistByEmail = async function (
  email: string,
): Promise<IUser | null> {
  return await User.findOne({ email })
}

userSchema.statics.isUserExistById = async function (
  _id: string,
): Promise<IUser | null> {
  return await User.findOne({ _id })
}

applyEncryption(userSchema, [
  'phoneNumber',
  'homeAddress',
  'city',
  'region',
  'location',
])

export const User = model<IUser, userModel>('User', userSchema)
