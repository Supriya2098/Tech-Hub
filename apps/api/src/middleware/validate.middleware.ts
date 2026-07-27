import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../lib/errors';

interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/** Validates request body/query/params against Zod schemas and replaces them with the parsed (coerced) values. */
export function validate(options: ValidateOptions) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (options.body) {
      const result = options.body.safeParse(req.body);
      if (!result.success) {
        return next(AppError.badRequest('Validation failed', result.error.flatten().fieldErrors));
      }
      req.body = result.data;
    }

    if (options.query) {
      const result = options.query.safeParse(req.query);
      if (!result.success) {
        return next(AppError.badRequest('Validation failed', result.error.flatten().fieldErrors));
      }
      req.query = result.data as unknown as Request['query'];
    }

    if (options.params) {
      const result = options.params.safeParse(req.params);
      if (!result.success) {
        return next(AppError.badRequest('Validation failed', result.error.flatten().fieldErrors));
      }
      req.params = result.data as unknown as Request['params'];
    }

    next();
  };
}
