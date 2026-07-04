import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import { app } from './src/app.js';

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGODB_URL)
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