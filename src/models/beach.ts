import mongoose, { Document, Model, Schema } from "mongoose"

export enum GeoPosition {
    N = "N",
    E = "E",
    S = "S",
    W = "W"
}

export interface Beach {
    _id?: string
    lat: number
    lng: number
    name: string
    position: GeoPosition
    userId: string
}

const schema = new mongoose.Schema(
    {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        name: { type: String, required: true },
        position: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true }
    },
    {
        toJSON: {
            transform(_, ret): void {
                ret.id = ret._id
                delete ret._id
                delete ret.__v
            }
        }
    }
)

interface BeachModel extends Omit<Beach, "_id">, Document {}
export const Beach: Model<BeachModel> = mongoose.model("Beach", schema)
