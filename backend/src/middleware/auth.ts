import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from './errorHandler';

export interface AuthPayload {
  userId: number;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authorization header missing'));
  }
  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = payload;
    return next();
  } catch (error) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
};

export const authorize =
  (allowed: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, 'Unauthenticated'));
    }
    const hasRole = req.user.roles.some((role) => allowed.includes(role));
    if (!hasRole) {
      return next(new HttpError(403, 'Forbidden'));
    }
    return next();
  };
