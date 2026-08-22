import express from 'express';
import { loginUser, logoutUser, registerUser, newRefreshTokenGeneration } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/isAdmin.middleware.js';
import { loginEmailLimiter, loginIpLimiter, refreshTokenLimiter, registerLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.post('/register', registerLimiter, registerUser);

router.post('/login', loginIpLimiter, loginEmailLimiter, loginUser);

router.delete('/logout', logoutUser);

router.post('/refresh-token', refreshTokenLimiter, newRefreshTokenGeneration);

// admin only routes
router.get('/admin-only', authMiddleware, isAdmin, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Welcome, Admin!"
    });
});

export default router;