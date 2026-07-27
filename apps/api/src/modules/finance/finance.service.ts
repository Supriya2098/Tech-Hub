import type { Prisma } from '@prisma/client';
import type { CreateInvoiceInput, CreatePaymentInput, InvoiceListQuery, UpdateInvoiceInput } from '@techhub/shared-types';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { buildPaginationMeta, toSkipTake } from '../../lib/pagination';
import { createNotification } from '../notifications/notifications.service';

export async function listInvoices(organizationId: string, query: InvoiceListQuery) {
  const where: Prisma.InvoiceWhereInput = {
    organizationId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.customerId ? { customerId: query.customerId } : {}),
    ...(query.search ? { invoiceNumber: { contains: query.search, mode: 'insensitive' } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, name: true } }, payments: true },
      ...toSkipTake(query.page, query.limit),
    }),
    prisma.invoice.count({ where }),
  ]);

  return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
}

export async function getInvoice(organizationId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId },
    include: { customer: { select: { id: true, name: true } }, payments: true },
  });
  if (!invoice) throw AppError.notFound('Invoice not found');
  return invoice;
}

export async function createInvoice(organizationId: string, input: CreateInvoiceInput) {
  const customer = await prisma.customer.findFirst({ where: { id: input.customerId, organizationId } });
  if (!customer) throw AppError.badRequest('customerId does not reference a valid customer');

  return prisma.invoice.create({
    data: {
      organizationId,
      customerId: input.customerId,
      invoiceNumber: input.invoiceNumber,
      amount: input.amount,
      status: input.status,
      dueAt: input.dueAt,
    },
  });
}

export async function updateInvoice(organizationId: string, id: string, input: UpdateInvoiceInput) {
  await getInvoice(organizationId, id);
  return prisma.invoice.update({
    where: { id },
    data: {
      ...(input.invoiceNumber !== undefined ? { invoiceNumber: input.invoiceNumber } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
      ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
    },
  });
}

export async function deleteInvoice(organizationId: string, id: string) {
  await getInvoice(organizationId, id);
  await prisma.invoice.delete({ where: { id } });
}

export async function recordPayment(organizationId: string, invoiceId: string, input: CreatePaymentInput) {
  const invoice = await getInvoice(organizationId, invoiceId);

  const payment = await prisma.payment.create({
    data: { invoiceId, amount: input.amount, method: input.method ?? 'manual' },
  });

  const totalPaid =
    invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(input.amount);

  if (totalPaid >= Number(invoice.amount) && invoice.status !== 'PAID') {
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'PAID', paidAt: new Date() } });
    await createNotification(organizationId, {
      type: 'SUCCESS',
      title: 'Invoice paid',
      message: `Invoice ${invoice.invoiceNumber} has been paid in full.`,
    });
  }

  return payment;
}
