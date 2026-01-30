import { model, Schema } from 'mongoose'
import { IRole, roleModel } from './role.interface'

const roleSchema = new Schema<IRole, roleModel>(
  {
    images: {
      type: String,
      required: true,
    },
    roleTitle: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Role = model<IRole, roleModel>('Role', roleSchema)
