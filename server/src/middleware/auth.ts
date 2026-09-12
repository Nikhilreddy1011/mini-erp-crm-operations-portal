import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { sendError } from '../utils/response';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: '', // Filled by controller if needed
      role: decoded.role
    };
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Access denied: insufficient permissions', 403);
    }

    next();
  };
};
