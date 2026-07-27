import { Router } from 'express';
import { loginSchema, refreshSchema, registerSchema } from '@techhub/shared-types';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimit.middleware';
import { loginHandler, logoutHandler, meHandler, refreshHandler, registerHandler } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate({ body: registerSchema }), asyncHandler(registerHandler));
authRouter.post('/login', authRateLimiter, validate({ body: loginSchema }), asyncHandler(loginHandler));
authRouter.post('/refresh', validate({ body: refreshSchema }), asyncHandler(refreshHandler));
authRouter.post('/logout', validate({ body: refreshSchema }), asyncHandler(logoutHandler));
authRouter.get('/me', requireAuth, asyncHandler(meHandler));
