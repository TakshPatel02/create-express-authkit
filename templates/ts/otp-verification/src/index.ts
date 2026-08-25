import 'dotenv/config';
import { connectDB } from './config/db.js';
import { app } from './app.js';

const PORT = process.env.PORT || 4000;

const mongoUri = process.env.MONGODB_URL;

if (!mongoUri) {
    console.error("MONGODB_URL is not defined in environment variables.");
    process.exit(1);
}

connectDB(mongoUri)
    .then(() => {
        console.log("Database connected");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Startup failed:", err);
        process.exit(1);
    });