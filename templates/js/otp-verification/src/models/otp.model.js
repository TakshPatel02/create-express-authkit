import { Schema, model } from "mongoose";

const otpSchema = new Schema({
    email:{
        type: String,
        required: true,
        index: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    otpHash:{
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt:{
        type: Date,
        required: true
    }
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = model("OTP", otpSchema);

export default OTP;