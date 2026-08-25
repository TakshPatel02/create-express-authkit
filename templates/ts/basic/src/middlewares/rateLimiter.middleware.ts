import rateLimit, { ipKeyGenerator, type Options } from 'express-rate-limit';
import type { Request, Response } from 'express';

const createRateLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: Request): string => {
            const email = req.body?.email as string | undefined;
            return email ? `${email}:${ipKeyGenerator(req.ip as string)}` : ipKeyGenerator(req.ip as string);
        },
        handler: (req: Request, res: Response) => {
            res.status(429).json({
                success: false,
                message
            });
        }
    });
};

const createIpRateLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: Request): string => ipKeyGenerator(req.ip as string),
        handler: (req: Request, res: Response) => {
            res.status(429).json({
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