import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';

export const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/users', userRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});