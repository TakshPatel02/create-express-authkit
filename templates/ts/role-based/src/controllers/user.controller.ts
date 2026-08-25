import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { loginSchema, signupSchema } from '../validations/auth.validation.js';
import { generateAccessToken, generateRefreshToken} from "../utils/token.util.js";

// Type imports
import type { Request, Response } from "express";
import type { ApiResponse } from "../types/apiResponse.types.js";
import type { TokenPayload } from "../types/jwt.types.js";

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

        const { name, email, password, role } = validatedData.data;

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
            password: hashedPassword,
            role
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
    accessToken: string;
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
            email: user.email,
            role: user.role
        }

        const access_token = generateAccessToken(payload);
        const refresh_token = generateRefreshToken(payload);

        user.refreshToken = refresh_token;
        await user.save();

        res.cookie("refreshToken", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                accessToken: access_token
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
            email: user.email,
            role: user.role
        }

        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
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

export {
    registerUser,
    loginUser,
    logoutUser,
    newRefreshTokenGeneration,
}