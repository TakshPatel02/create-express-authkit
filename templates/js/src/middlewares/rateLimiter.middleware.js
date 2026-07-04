import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const forgetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 requests per window
    standardHeaders: true,     // return rate limit info in RateLimit-* headers
    legacyHeaders: false,
    keyGenerator: (req) => req.body.email || ipKeyGenerator(req.ip), // limit per email, fallback to IP
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: 'Too many password reset requests. Please try again after 15 minutes.'
        });
    }
});

export const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.body.email || ipKeyGenerator(req.ip),
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: 'Too many attempts. Please try again after 15 minutes.'
        });
    }
});