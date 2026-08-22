import express from 'express';
import { loginUser, logoutUser, registerUser, newRefreshTokenGeneration, forgetPassword, resetPassword, verifyResetOTP } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { forgetPasswordLimiter, verifyOtpLimiter, loginEmailLimiter, loginIpLimiter, refreshTokenLimiter, registerLimiter, resetPasswordLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/register', registerLimiter, registerUser);

router.post('/login', loginIpLimiter, loginEmailLimiter, loginUser);

router.delete('/logout', logoutUser);

router.post('/refresh-token', refreshTokenLimiter, newRefreshTokenGeneration);

router.post('/forget-password', forgetPasswordLimiter, forgetPassword);

router.post('/verify-reset-otp', verifyOtpLimiter, verifyResetOTP);

router.post('/reset-password', resetPasswordLimiter, resetPassword);

export default router;