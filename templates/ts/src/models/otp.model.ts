import { Schema, model, Model } from "mongoose";
import type {IOTP} from "../types/otp.types.js";

const otpSchema = new Schema<IOTP>({
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

const OTP : Model<IOTP> = model<IOTP>("OTP", otpSchema);

export default OTP;