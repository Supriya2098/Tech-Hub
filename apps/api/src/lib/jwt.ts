import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env';
import type { Role } from '@techhub/shared-types';

export interface AccessTokenPayload {
  sub: string;
  organizationId: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

/** Refresh tokens are stored hashed in the DB so a leaked DB dump alone can't be replayed. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function msFromExpiresIn(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 15 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 60_000;
  return value * unitMs;
}
