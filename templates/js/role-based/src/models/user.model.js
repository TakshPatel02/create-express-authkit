import { Schema, model } from "mongoose";

const userSchema = new Schema({
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
    role: {
        enum: ["user", "admin"],
        type: String,
        required: true,
        default: "user"
    },
    refreshToken: {
        type: String,
        default: null
    }
}, { timestamps: true });

const User = model("User", userSchema);

export default User;