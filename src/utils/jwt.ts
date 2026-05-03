import jwt from 'jsonwebtoken';
import { config } from '../config';
import { TokenPayload, UserRole } from '../types';

export const signAccessToken = (id: string, role: UserRole): string =>
  jwt.sign({ id, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

export const signRefreshToken = (id: string, role: UserRole): string =>
  jwt.sign({ id, role }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, config.jwt.secret) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
