import { Model } from 'mongoose'

export interface IRole {
  _id?: string
  images: string
  roleTitle: string
  createdAt?: Date
  updatedAt?: Date
}

export type roleModel = Model<IRole>
