import { Schema, model, Model } from 'mongoose';
import type { IResetToken } from '../types/resetToken.types.js';

const resetTokenSchema = new Schema<IResetToken>({
    jti: {
        type: String,
        required: true,
        unique: true
    },
    used: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ResetToken : Model<IResetToken> = model<IResetToken>('ResetToken', resetTokenSchema);

export default ResetToken;