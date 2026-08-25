import type { TokenPayload } from "./jwt.types.js"

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export {};