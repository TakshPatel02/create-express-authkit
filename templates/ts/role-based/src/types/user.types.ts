import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    refreshToken: string | null;
    role: "user" | "admin";
    createdAt?: Date;
    updatedAt?: Date;
}