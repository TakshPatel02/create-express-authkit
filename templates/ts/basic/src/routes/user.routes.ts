import express from 'express';
import { loginUser, logoutUser, registerUser, newRefreshTokenGeneration } from '../controllers/user.controller.js';
import { loginEmailLimiter, loginIpLimiter, refreshTokenLimiter, registerLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/register', registerLimiter, registerUser);

router.post('/login', loginIpLimiter, loginEmailLimiter, loginUser);

router.delete('/logout', logoutUser);

router.post('/refresh-token', refreshTokenLimiter, newRefreshTokenGeneration);

export default router;