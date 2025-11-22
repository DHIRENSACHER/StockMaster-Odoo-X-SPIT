import { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../config/firebase';
import { HttpError } from './errorHandler';
import { ensureUserFromFirebase } from '../services/userService';

export interface AuthPayload {
  userId: number;
  email: string;
  roles: string[];
  firebaseUid?: string;
  fullName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authorization header missing'));
  }
  const token = header.substring(7);
  try {
    const payload = await firebaseAuth.verifyIdToken(token);
    const email = payload.email;
    if (!email) throw new HttpError(401, 'Email missing in token');

    const user = await ensureUserFromFirebase({
      email,
      fullName: payload.name,
      firebaseUid: payload.uid,
    });

    req.user = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      firebaseUid: payload.uid,
      fullName: user.fullName,
    };
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
