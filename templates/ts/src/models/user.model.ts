import { Schema, model, Model } from "mongoose";
import type { IUser } from "../types/user.types.js";

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken:{
        type: String,
        default: null
    }
}, { timestamps: true });

const User : Model<IUser> = model<IUser>("User", userSchema);

export default User;