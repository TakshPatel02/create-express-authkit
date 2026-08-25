import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import ResetToken from "../models/resetToken.model.js";
import { forgetPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, verifyOtpSchema } from '../validations/auth.validation.js';
import sendEmail from "../services/email.service.js";
import { generateOTP, getOTPHtml, passwordResetHtml } from '../utils/otp.util.js';
import { generateAccessToken, generateRefreshToken, generateResetPasswordToken } from "../utils/token.util.js";

// Type imports
import type { Request, Response } from "express";
import type { ApiResponse } from "../types/apiResponse.types.js";
import type { TokenPayload, ResetPasswordPayload, DecodedResetToken } from "../types/jwt.types.js";

interface RegisterResponseData {
    userId: string;
}

const registerUser = async (
    req: Request,
    res: Response<ApiResponse<RegisterResponseData>>
) => {
    try {
        const validatedData = await signupSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.'
            });
            return;
        }

        const { name, email, password } = validatedData.data;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists"
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                userId: newUser._id.toString()
            }
        })

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        })
    }
}

interface LoginResponseData {
    token: string;
}

const loginUser = async (
    req: Request,
    res: Response<ApiResponse<LoginResponseData>>
) => {
    try {
        const validatedData = await loginSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.'
            });
            return;
        }

        const { email, password } = validatedData.data;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
            return;
        }

        const payload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        }

        const access_token = generateAccessToken(payload);
        const refresh_token = generateRefreshToken(payload);

        user.refreshToken = refresh_token;
        await user.save();

        res.cookie("refreshToken", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token: access_token
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        })
    }
}

const logoutUser = async (
    req: Request,
    res: Response<ApiResponse<null>>
) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: "No refresh token provided"
            });
            return;
        }

        const user = await User.findOne({ refreshToken });

        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: 'strict' });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during logout"
        })
    }
}

interface RefreshResponseData {
    accessToken: string;
}

const newRefreshTokenGeneration = async (
    req: Request,
    res: Response<ApiResponse<RefreshResponseData>>
) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'No refresh token provided.'
            });
            return;
        }

        const user = await User.findOne({ refreshToken });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid refresh token.'
            });
            return;
        }

        const secret = process.env.REFRESH_JWT_SECRET;
        if (!secret) {
            throw new Error("REFRESH_JWT_SECRET is not defined in environment variables.");
        }

        let decoded: TokenPayload;
        try {
            decoded = jwt.verify(refreshToken, secret) as unknown as TokenPayload;
        } catch (err) {
            res.status(400).json({
                success: false,
                message: 'Invalid refresh token.'
            });
            return;
        }

        if (decoded.id !== user._id.toString()) {
            res.status(400).json({
                success: false,
                message: 'Invalid refresh token.'
            });
            return;
        }

        const payload: TokenPayload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        }

        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        res.status(200).json({
            success: true,
            message: 'Access token refreshed successfully.',
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while refreshing the access token.'
        })
    }
}

const forgetPassword = async (
    req: Request,
    res: Response<ApiResponse<null>>
) => {
    try {
        const validatedData = await forgetPasswordSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.'
            });
            return;
        }

        const { email } = validatedData.data;

        const user = await User.findOne({ email });

        if (user) {
            await OTP.deleteMany({ email });
            const otp = generateOTP();
            const otpHash = await bcrypt.hash(otp, 10);
            await OTP.create({ email, user: user._id, otpHash, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
            await sendEmail(email, 'Reset Your Password', `Your OTP is: ${otp}`, passwordResetHtml(otp));
        }

        res.status(200).json({
            success: true,
            message: 'If this email exists, an OTP has been sent.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting the password.'
        });
    }
}

interface VerifyOtpResponseData {
    resetToken: string;
}

const verifyResetOTP = async (
    req: Request,
    res: Response<ApiResponse<VerifyOtpResponseData>>
) => {
    try {
        const validatedData = await verifyOtpSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.'
            });
            return;
        }

        const { email, otp } = validatedData.data;

        const otpRecord = await OTP.findOne({
            email,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            res.status(400).json({
                success: false,
                message: 'OTP has expired or is invalid.'
            });
            return;
        }

        if (otpRecord.attempts >= 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            res.status(429).json({
                success: false,
                message: 'Too many failed attempts. Please request a new OTP.'
            });
            return;
        }

        const isOTPValid = await bcrypt.compare(otp, otpRecord.otpHash);

        if (!isOTPValid) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            res.status(400).json({
                success: false,
                message: 'Invalid OTP.'
            });
            return;
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        const jti = crypto.randomUUID();

        const payload : ResetPasswordPayload = {
            id: otpRecord.user,
            email: otpRecord.email,
            jti
        }

        const resetToken = generateResetPasswordToken(payload);

        await ResetToken.create({
            jti,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        })

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.',
            data: {
                resetToken: resetToken
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the reset OTP.'
        })
    }
}

const resetPassword = async (
    req: Request,
    res: Response<ApiResponse<null>>
) => {
    try {
        const validatedData = await resetPasswordSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.'
            });
            return;
        }

        const { newPassword } = validatedData.data;

        const resetToken = req.headers.authorization?.split(' ')[1];

        if (!resetToken) {
            res.status(400).json({
                success: false,
                message: 'No reset token provided.'
            });
            return;
        }

        const secret = process.env.JWT_RESET_PASSWORD_TOKEN_SECRET;
        if (!secret) {
            throw new Error("JWT_RESET_PASSWORD_TOKEN_SECRET is not defined in environment variables.");
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, secret) as unknown as DecodedResetToken;

        } catch (err) {
            console.error(err);
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.'
            });
            return;
        }

        const jti = decoded.payload.jti;

        const tokenRecord = await ResetToken.findOneAndUpdate(
            { jti, used: false },
            { used: true },
            { new: true }
        );

        if (!tokenRecord) {
            res.status(400).json({
                success: false,
                message: 'This reset link has already been used or is invalid.'
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.updateOne(
            { _id: decoded.payload.id },
            {
                password: hashedPassword,
                refreshToken: null
            }
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please log in with your new password.'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'An error occurred while resetting the password.'
        })
    }
}

export {
    registerUser,
    loginUser,
    logoutUser,
    newRefreshTokenGeneration,
    forgetPassword,
    resetPassword,
    verifyResetOTP
}