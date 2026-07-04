import express from 'express';
import { loginUser, logoutUser, registerUser, newRefreshTokenGeneration, forgetPassword, resetPassword, verifyResetOTP } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { forgetPasswordLimiter, verifyOtpLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.delete('/logout', authMiddleware, logoutUser);

router.post('/refresh-token', newRefreshTokenGeneration);

router.post('/forget-password', forgetPasswordLimiter, forgetPassword);

router.post('/verify-reset-otp', verifyOtpLimiter,verifyResetOTP);

router.post('/reset-password', resetPassword);

export default router;