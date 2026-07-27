import bcrypt from 'bcrypt';
import type { UpdateOrgSettingsInput, UpdateProfileInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';

export async function getOrgSettings(organizationId: string) {
  const settings = await prisma.orgSettings.upsert({
    where: { organizationId },
    update: {},
    create: { organizationId },
    include: { organization: { select: { name: true } } },
  });
  return { ...settings, organizationName: settings.organization.name };
}

export async function updateOrgSettings(organizationId: string, input: UpdateOrgSettingsInput) {
  if (input.organizationName !== undefined) {
    await prisma.organization.update({ where: { id: organizationId }, data: { name: input.organizationName } });
  }

  const settings = await prisma.orgSettings.upsert({
    where: { organizationId },
    update: {
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.dateFormat !== undefined ? { dateFormat: input.dateFormat } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl || null } : {}),
    },
    create: { organizationId },
    include: { organization: { select: { name: true } } },
  });

  return { ...settings, organizationName: settings.organization.name };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');

  const data: { name?: string; passwordHash?: string } = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  if (input.newPassword) {
    if (!input.currentPassword) {
      throw AppError.badRequest('currentPassword is required to set a new password');
    }
    const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw AppError.unauthorized('Current password is incorrect');
    }
    data.passwordHash = await bcrypt.hash(input.newPassword, 12);
  }

  const updated = await prisma.user.update({ where: { id: userId }, data });
  return { id: updated.id, name: updated.name, email: updated.email, role: updated.role };
}
