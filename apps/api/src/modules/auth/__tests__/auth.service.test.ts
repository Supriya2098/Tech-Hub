import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import { AppError } from '../../../lib/errors';

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  organization: {
    create: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(async (callback: (tx: typeof prismaMock) => unknown) => callback(prismaMock)),
};

vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock }));

const seedStarterDataMock = vi.fn().mockResolvedValue(undefined);
vi.mock('../../../lib/demoData', () => ({ seedStarterData: seedStarterDataMock }));

const { register, login } = await import('../auth.service');

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('creates an organization and an ADMIN user when the email is unused', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.organization.create.mockResolvedValueOnce({ id: 'org_1', name: 'Acme' });
      prismaMock.user.create.mockResolvedValueOnce({
        id: 'user_1',
        organizationId: 'org_1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'ADMIN',
        organization: { name: 'Acme' },
      });
      prismaMock.refreshToken.create.mockResolvedValueOnce({});

      const result = await register({
        organizationName: 'Acme',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'Password123',
      });

      expect(result.user).toMatchObject({ email: 'ada@example.com', role: 'ADMIN', organizationName: 'Acme' });
      expect(result.tokens.accessToken).toEqual(expect.any(String));
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ role: 'ADMIN', email: 'ada@example.com' }) }),
      );
      expect(seedStarterDataMock).toHaveBeenCalledWith(
        expect.objectContaining({ organizationId: 'org_1', adminUserId: 'user_1', adminEmail: 'ada@example.com' }),
      );
    });

    it('rejects registration when the email is already taken', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'existing' });

      await expect(
        register({ organizationName: 'Acme', name: 'Ada', email: 'ada@example.com', password: 'Password123' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(login({ email: 'nobody@example.com', password: 'whatever' })).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('rejects an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 12);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user_1',
        organizationId: 'org_1',
        isActive: true,
        passwordHash,
        role: 'ADMIN',
        organization: { name: 'Acme' },
      });

      await expect(login({ email: 'ada@example.com', password: 'wrong-password' })).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('issues tokens for a correct password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 12);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user_1',
        organizationId: 'org_1',
        isActive: true,
        passwordHash,
        role: 'ADMIN',
        email: 'ada@example.com',
        organization: { name: 'Acme' },
      });
      prismaMock.refreshToken.create.mockResolvedValueOnce({});

      const result = await login({ email: 'ada@example.com', password: 'correct-password' });
      expect(result.tokens.accessToken).toEqual(expect.any(String));
      expect(result.tokens.refreshToken).toEqual(expect.any(String));
    });
  });
});
