import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@techhub/shared-types';
import { AppError } from '../lib/errors';
import { verifyAccessToken } from '../lib/jwt';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid Authorization header'));
  }

  const token = header.slice('Bearer '.length);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired access token'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}
