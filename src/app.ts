import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

const app = express();

// ── Security ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
app.use(mongoSanitize());
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Body parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());

// ── Request logging ───────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', env: config.env });
});

// ── API routes ────────────────────────────────────────────────────
app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// ── Error handling ────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
