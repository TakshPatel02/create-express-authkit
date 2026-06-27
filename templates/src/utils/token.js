import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
    return jwt.sign(
        user,
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: process.env.ACCESS_JWT_EXPIRES_IN || '15m' }
    );
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        user,
        process.env.REFRESH_JWT_SECRET,
        { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN || '7d' }
    );
}

export {
    generateAccessToken,
    generateRefreshToken
}