import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', errors: err.flatten() });
  }

  if (err instanceof HttpError) {
    if (err.statusCode >= 500) {
      logger.error(err, 'Server error');
    }
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  logger.error(err, 'Unhandled error');
  res.status(500).json({ message: 'Unexpected server error' });
};
