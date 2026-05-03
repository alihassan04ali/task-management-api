import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    error = ApiError.conflict(`${field} already exists`);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    error = ApiError.badRequest(message);
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : 'Internal server error';
  const isOperational = error instanceof ApiError ? error.isOperational : false;

  if (!isOperational) {
    logger.error(`[${req.method}] ${req.path} — ${err.message}`, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === 'development' && !isOperational && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};
