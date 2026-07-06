import { Document, Types } from "mongoose";

export interface IOTP extends Document {
    email: string;
    user: Types.ObjectId;
    otpHash: string;
    attempts: number;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}