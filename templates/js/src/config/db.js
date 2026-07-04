import mongoose from "mongoose";

export const connectDB = async (connectionURL) => {
    try{
        const conn = await mongoose.connect(connectionURL);
        return conn;
    } catch(err){
        console.error("Database connection error:", err);
        throw err;
    }
}