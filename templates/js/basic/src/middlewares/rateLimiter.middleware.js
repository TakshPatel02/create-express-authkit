import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            const email = req.body?.email;
            return email ? `${email}:${ipKeyGenerator(req.ip)}` : ipKeyGenerator(req.ip);
        },
        handler: (req, res) => {
            return res.status(429).json({
                success: false,
                message
            });
        }
    });
};

const createIpRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => ipKeyGenerator(req.ip),
        handler: (req, res) => {
            return res.status(429).json({
                success: false,
                message
            });
        }
    });
};

export const loginIpLimiter = createIpRateLimiter(
    15 * 60 * 1000,
    20,
    'Too many login attempts from this IP. Please try again later.'
);

export const loginEmailLimiter = createRateLimiter(
    60 * 60 * 1000,
    5,
    'Too many login attempts for this account. Please try again after 1 hour.'
);

export const registerLimiter = createIpRateLimiter(
    60 * 60 * 1000,
    5,
    'Too many registration attempts from this IP. Please try again after 1 hour.'
);

export const refreshTokenLimiter = createIpRateLimiter(
    15 * 60 * 1000,
    20,
    'Too many token refresh attempts. Please try again later.'
);