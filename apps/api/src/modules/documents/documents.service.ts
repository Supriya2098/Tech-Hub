import type { Prisma } from '@prisma/client';
import type { CreateDocumentInput, DocumentListQuery, UpdateDocumentInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { buildPaginationMeta, toSkipTake } from '../../lib/pagination';

export async function listDocuments(organizationId: string, query: DocumentListQuery) {
  const where: Prisma.DocumentWhereInput = {
    organizationId,
    ...(query.tag ? { tags: { has: query.tag } } : {}),
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.document.findMany({ where, orderBy: { createdAt: 'desc' }, ...toSkipTake(query.page, query.limit) }),
    prisma.document.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function getDocument(organizationId: string, id: string) {
  const document = await prisma.document.findFirst({ where: { id, organizationId } });
  if (!document) throw AppError.notFound('Document not found');
  return document;
}

export async function createDocument(organizationId: string, input: CreateDocumentInput) {
  return prisma.document.create({
    data: {
      organizationId,
      name: input.name,
      url: input.url,
      mimeType: input.mimeType || null,
      sizeBytes: input.sizeBytes,
      tags: input.tags ?? [],
    },
  });
}

export async function updateDocument(organizationId: string, id: string, input: UpdateDocumentInput) {
  await getDocument(organizationId, id);
  return prisma.document.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.mimeType !== undefined ? { mimeType: input.mimeType || null } : {}),
      ...(input.sizeBytes !== undefined ? { sizeBytes: input.sizeBytes } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
    },
  });
}

export async function deleteDocument(organizationId: string, id: string) {
  await getDocument(organizationId, id);
  await prisma.document.delete({ where: { id } });
}
