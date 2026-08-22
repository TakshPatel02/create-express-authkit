import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import User from "../models/user.model.js";
import OTP from "../models/otp.model.js";
import ResetToken from "../models/resetToken.model.js";
import { forgetPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, verifyOtpSchema } from '../validations/user.validation.js';
import sendEmail from '../services/email.service.js';
import { generateOTP, getOTPHtml, passwordResetHtml } from '../utils/otp.util.js';
import { generateAccessToken, generateRefreshToken, generateResetPasswordToken } from "../utils/token.util.js";

const registerUser = async (req, res) => {
    try {
        const validatedData = await signupSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.',
            });
        }

        const { name, email, password } = validatedData.data;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
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
            userId: newUser._id
        })

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const validatedData = await loginSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.',
            });
        }

        const { email, password } = validatedData.data;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const payload = {
            id: user._id,
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
            sameSite: 'Strict'
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: access_token
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error during login"
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "No refresh token provided"
            });
        }

        const user = await User.findOne({ refreshToken });

        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: 'Strict' });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error during logout"
        })
    }
}

const newRefreshTokenGeneration = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'No refresh token provided.' });
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid refresh token.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'Invalid or expired refresh token.' });
        }

        if (decoded.id !== user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Invalid refresh token.' });
        }

        const payload = { id: user._id, name: user.name, email: user.email };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.status(200).json({
            success: true,
            message: 'Access token refreshed successfully.',
            token: newAccessToken
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'An error occurred while refreshing the access token.' });
    }
};


const forgetPassword = async (req, res) => {
    try {
        const validatedData = await forgetPasswordSchema.safeDecodeAsync(req.body);

       if(!validatedData.success){
            return res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.',
            });
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

        return res.status(200).json({
            success: true,
            message: 'If this email exists, an OTP has been sent.'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'An error occurred while resetting the password.' });
    }
}

const verifyResetOTP = async (req, res) => {
    try {
        const validatedData = await verifyOtpSchema.safeParseAsync(req.body);

        if(!validatedData.success){
            return res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.',
            });
        }

        const { email, otp } = validatedData.data;

        const otpRecord = await OTP.findOne({
            email,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired or is invalid.'
            });
        }

        if (otpRecord.attempts >= 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({
                success: false,
                message: 'Too many failed attempts. Please request a new OTP.'
            });
        }

        const isOTPValid = await bcrypt.compare(otp, otpRecord.otpHash);

        if (!isOTPValid) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.'
            });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        const jti = crypto.randomUUID();

        const payload = {
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
        return res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the reset OTP.'
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const validatedData = await resetPasswordSchema.safeParseAsync(req.body);

        if(!validatedData.success){
            return res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.',
            });
        }

        const { newPassword } = validatedData.data;

        const resetToken = req.headers.authorization?.split(' ')[1];

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: 'No reset token provided.'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_RESET_PASSWORD_TOKEN_SECRET);

        } catch (err) {
            console.error(err);
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token.'
            });
        }

        const jti = decoded.payload.jti;

        const tokenRecord = await ResetToken.findOneAndUpdate(
            { jti, used: false },
            { used: true },
            { new: true }
        );

        if (!tokenRecord) {
            return res.status(400).json({
                success: false,
                message: 'This reset link has already been used or is invalid.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.updateOne(
            { _id: decoded.payload.id },
            {
                password: hashedPassword,
                refreshToken: null
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please log in with your new password.'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
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