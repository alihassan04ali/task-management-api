import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(ApiError.unauthorized('No token provided'));

  const token = header.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const authorize =
  (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
