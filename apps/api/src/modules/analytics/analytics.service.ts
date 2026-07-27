import { prisma } from '../../lib/prisma';

function monthLabel(date: Date) {
  return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
}

function lastNMonthStarts(n: number): Date[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1));
}

export async function getAnalyticsOverview(organizationId: string) {
  const months = lastNMonthStarts(6);

  const revenueByMonth = await Promise.all(
    months.map(async (start, i) => {
      const end = i < months.length - 1 ? months[i + 1] : new Date();
      const sum = await prisma.payment.aggregate({
        where: { invoice: { organizationId }, paidAt: { gte: start, lt: end } },
        _sum: { amount: true },
      });
      return { month: monthLabel(start), revenue: Number(sum._sum.amount ?? 0) };
    }),
  );

  const newCustomersByMonth = await Promise.all(
    months.map(async (start, i) => {
      const end = i < months.length - 1 ? months[i + 1] : new Date();
      const count = await prisma.customer.count({ where: { organizationId, createdAt: { gte: start, lt: end } } });
      return { month: monthLabel(start), count };
    }),
  );

  const [tasksByStatus, projectsByStatus, invoicesByStatus, totalTasks, doneTasks] = await Promise.all([
    prisma.task.groupBy({ by: ['status'], where: { organizationId }, _count: { _all: true } }),
    prisma.project.groupBy({ by: ['status'], where: { organizationId }, _count: { _all: true } }),
    prisma.invoice.groupBy({ by: ['status'], where: { organizationId }, _count: { _all: true } }),
    prisma.task.count({ where: { organizationId } }),
    prisma.task.count({ where: { organizationId, status: 'DONE' } }),
  ]);

  return {
    revenueByMonth,
    newCustomersByMonth,
    tasksByStatus: tasksByStatus.map((t) => ({ status: t.status, count: t._count._all })),
    projectsByStatus: projectsByStatus.map((p) => ({ status: p.status, count: p._count._all })),
    invoicesByStatus: invoicesByStatus.map((inv) => ({ status: inv.status, count: inv._count._all })),
    taskCompletionRate: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
  };
}
