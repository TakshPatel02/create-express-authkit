import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { TokenPayload } from "../types/jwt.types.js";

const generateAccessToken = (user: TokenPayload): string => {
    const secret = process.env.ACCESS_JWT_SECRET;
    if (!secret) {
        throw new Error("ACCESS_JWT_SECRET is not defined in environment variables.");
    }

    return jwt.sign(
        user,
        secret,
        { expiresIn: process.env.ACCESS_JWT_EXPIRES_IN || '15m' } as SignOptions
    );
}

const generateRefreshToken = (user: TokenPayload): string => {
    const secret = process.env.REFRESH_JWT_SECRET;
    if (!secret) {
        throw new Error("REFRESH_JWT_SECRET is not defined in environment variables.");
    }

    return jwt.sign(
        user,
        secret,
        { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN || '7d' } as SignOptions
    );
}

export {
    generateAccessToken,
    generateRefreshToken,
}