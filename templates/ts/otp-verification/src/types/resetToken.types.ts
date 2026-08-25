import { Document } from "mongoose";

export interface IResetToken extends Document {
    jti: string;
    used: boolean;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}