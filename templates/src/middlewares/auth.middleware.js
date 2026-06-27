import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

        req.user = decoded;
        next();

    } catch(err){
        console.error("Auth middleware error:", err);
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
}