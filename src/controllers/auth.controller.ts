import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, tokens } = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, ...tokens },
    });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, tokens } = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, ...tokens },
    });
  } catch (err) { next(err); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokens = await authService.refreshTokens(req.body.refreshToken);
    res.status(200).json({ success: true, message: 'Tokens refreshed', data: tokens });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.logoutUser(req.user!.id);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ success: true, message: 'Current user', data: { user: req.user } });
  } catch (err) { next(err); }
};
