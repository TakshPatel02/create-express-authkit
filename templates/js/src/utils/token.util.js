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

const generateResetPasswordToken = (payload) => {
    return jwt.sign({
        payload
    }, process.env.JWT_RESET_PASSWORD_TOKEN_SECRET, {
        expiresIn: process.env.RESET_PASSWORD_JWT_EXPIRES_IN || '15m'
    });
}

export {
    generateAccessToken,
    generateRefreshToken,
    generateResetPasswordToken
}