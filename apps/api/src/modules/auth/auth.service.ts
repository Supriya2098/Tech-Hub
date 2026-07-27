import bcrypt from 'bcrypt';
import type { AuthResponse, LoginInput, RegisterInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import {
  hashToken,
  msFromExpiresIn,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../lib/jwt';
import { env } from '../../config/env';
import { seedStarterData } from '../../lib/demoData';
import { logger } from '../../lib/logger';

const SALT_ROUNDS = 12;

async function issueTokenPair(user: { id: string; organizationId: string; role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' }) {
  const accessToken = signAccessToken({ sub: user.id, organizationId: user.organizationId, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + msFromExpiresIn(env.JWT_REFRESH_EXPIRES_IN)),
    },
  });

  return { accessToken, refreshToken, expiresIn: env.JWT_ACCESS_EXPIRES_IN };
}

function toAuthUser(user: {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  organization: { name: string };
}) {
  return {
    id: user.id,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: input.organizationName, settings: { create: {} } },
    });

    return tx.user.create({
      data: {
        organizationId: organization.id,
        name: input.name,
        email: input.email,
        passwordHash,
        role: 'ADMIN',
      },
      include: { organization: true },
    });
  });

  // Populate the new organization with a realistic starter dataset (staff,
  // clients, projects, tasks, invoices, documents) so the app is never blank
  // on first login. Best-effort: a failure here shouldn't fail registration.
  try {
    await seedStarterData({
      organizationId: user.organizationId,
      orgDisplayName: user.organization.name,
      adminUserId: user.id,
      adminName: user.name,
      adminEmail: user.email,
    });
  } catch (err) {
    logger.error('Failed to seed starter data for new organization', {
      organizationId: user.organizationId,
      err: err instanceof Error ? err.message : err,
    });
  }

  const tokens = await issueTokenPair(user);
  return { user: toAuthUser(user), tokens };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { organization: true },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokenPair(user);
  return { user: toAuthUser(user), tokens };
}

export async function refresh(refreshTokenValue: string): Promise<AuthResponse> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const tokenHash = hashToken(refreshTokenValue);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
    throw AppError.unauthorized('Refresh token is no longer valid');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { organization: true } });
  if (!user || !user.isActive) {
    throw AppError.unauthorized('Account is no longer active');
  }

  // Rotate: revoke the used token and issue a fresh pair.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const tokens = await issueTokenPair(user);

  return { user: toAuthUser(user), tokens };
}

export async function logout(refreshTokenValue: string): Promise<void> {
  const tokenHash = hashToken(refreshTokenValue);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return toAuthUser(user);
}
