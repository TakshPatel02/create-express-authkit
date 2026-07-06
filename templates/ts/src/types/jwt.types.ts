import { Types } from "mongoose";

export interface ResetPasswordPayload {
    id: Types.ObjectId | string;
    email: string;
    jti: string;
}

export interface DecodedResetToken {
    payload: ResetPasswordPayload;
    iat: number;
    exp: number;
}

export interface TokenPayload {
    id: string;
    name: string;
    email: string;
}