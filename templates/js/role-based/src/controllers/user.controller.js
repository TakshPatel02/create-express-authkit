import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { loginSchema, signupSchema } from '../validations/user.validation.js';
import { generateAccessToken, generateRefreshToken } from "../utils/token.util.js";

const registerUser = async (req, res) => {
    try {
        const validatedData = await signupSchema.safeParseAsync(req.body);

        if (!validatedData.success) {
            return res.status(400).json({
                success: false,
                message: validatedData.error.issues[0]?.message || 'Validation failed.',
            });
        }

        const { name, email, password, role } = validatedData.data;

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
            password: hashedPassword,
            role
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
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
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

        const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
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


export {
    registerUser,
    loginUser,
    logoutUser,
    newRefreshTokenGeneration,
}