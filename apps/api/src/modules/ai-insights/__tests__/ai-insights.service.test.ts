import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  task: { count: vi.fn() },
  employee: { findMany: vi.fn() },
  payment: { aggregate: vi.fn() },
  invoice: { groupBy: vi.fn(), count: vi.fn(), findMany: vi.fn() },
  customer: { findMany: vi.fn() },
  project: { count: vi.fn() },
};

vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock }));

const { generateInsights } = await import('../ai-insights.service');

describe('ai-insights.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.employee.findMany.mockResolvedValue([]);
    prismaMock.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });
    prismaMock.invoice.groupBy.mockResolvedValue([]);
    prismaMock.invoice.count.mockResolvedValue(0);
    prismaMock.project.count.mockResolvedValue(0);
    prismaMock.task.count.mockResolvedValue(0);
  });

  it('reports an all-clear insight when nothing is flagged', async () => {
    const insights = await generateInsights('org_1');
    expect(insights).toHaveLength(1);
    expect(insights[0].id).toBe('all-clear');
    expect(insights[0].severity).toBe('success');
  });

  it('flags a high overdue-task ratio', async () => {
    prismaMock.task.count.mockImplementation(async ({ where }: any) => {
      if ('dueDate' in where) return 5; // overdue
      return 10; // open
    });

    const insights = await generateInsights('org_1');
    const overdueInsight = insights.find((i) => i.id === 'overdue-tasks');
    expect(overdueInsight).toBeDefined();
    expect(overdueInsight?.severity).toBe('alert');
  });

  it('flags overdue invoices', async () => {
    prismaMock.invoice.count.mockResolvedValueOnce(3);

    const insights = await generateInsights('org_1');
    const overdueInvoices = insights.find((i) => i.id === 'overdue-invoices');
    expect(overdueInvoices).toBeDefined();
    expect(overdueInvoices?.severity).toBe('alert');
  });
});
