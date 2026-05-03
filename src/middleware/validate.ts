import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/apiError';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate =
  (schema: Joi.ObjectSchema, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(ApiError.badRequest(message));
    }

    req[target] = value;
    next();
  };

// ── Auth schemas ──────────────────────────────────────────────────
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'user'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// ── Task schemas ──────────────────────────────────────────────────
export const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  description: Joi.string().max(1000),
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso().min('now'),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  assignedTo: Joi.string().hex().length(24),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(120),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso().allow(null),
  tags: Joi.array().items(Joi.string().max(30)).max(10),
  assignedTo: Joi.string().hex().length(24).allow(null),
}).min(1);

export const taskQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('createdAt', 'dueDate', 'priority', 'title').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  search: Joi.string().max(100),
});
