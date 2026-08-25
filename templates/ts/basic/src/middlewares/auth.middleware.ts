import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/jwt.types.js";
import type { Request, Response, NextFunction } from "express";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
            return;
        }

        const secret = process.env.ACCESS_JWT_SECRET;
        if (!secret) {
            throw new Error("ACCESS_JWT_SECRET is not defined in environment variables.");
        }

        const decoded = jwt.verify(token, secret) as TokenPayload;

        req.user = decoded;
        next();

    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
}