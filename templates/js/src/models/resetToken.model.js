import {Schema, model} from 'mongoose';

const resetTokenSchema = new Schema({
    jti:{
        type: String,
        required: true,
        unique: true
    },
    used:{
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {timestamps: true});

resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ResetToken = model('ResetToken', resetTokenSchema);

export default ResetToken;