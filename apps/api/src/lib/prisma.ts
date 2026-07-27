import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// In serverless environments (Vercel functions), modules can be re-evaluated
// across invocations within the same warm lambda. Caching the client on
// `globalThis` avoids exhausting the Postgres connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
