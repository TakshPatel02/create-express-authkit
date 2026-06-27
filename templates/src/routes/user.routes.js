import express from 'express';
import { loginUser, logoutUser, registerUser, newRefreshTokenGeneration } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.delete('/logout', authMiddleware, logoutUser);

router.post('/refresh-token', newRefreshTokenGeneration);

export default router;