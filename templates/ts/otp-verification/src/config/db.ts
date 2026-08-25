import mongoose from "mongoose";
import type {Connection} from "mongoose";

export const connectDB = async (connectionURL: string): Promise<Connection> => {
    try{
        const conn = await mongoose.connect(connectionURL);
        return conn.connection;
    } catch(err){
        console.error("Database connection error:", err);
        throw err;
    }
}