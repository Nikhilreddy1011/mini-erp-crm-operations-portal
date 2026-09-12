import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return sendError(res, 'Validation error', 400, formattedErrors);
  }

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'Unauthorized access', 401);
  }

  // Custom application operational errors
  if (err.statusCode && err.message) {
    return sendError(res, err.message, err.statusCode, err.errors || []);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    const target = err.meta?.target ? `Duplicate field: ${err.meta.target}` : 'Duplicate record error';
    return sendError(res, target, 409);
  }

  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';

  return sendError(res, message, 500);
};
