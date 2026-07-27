import { prisma } from '../../lib/prisma';

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfPreviousMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export async function getDashboardSummary(organizationId: string) {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfPreviousMonth(now);

  const [
    customerCount,
    activeProjectCount,
    openTaskCount,
    overdueTaskCount,
    employeeCount,
    revenueThisMonth,
    revenueLastMonth,
    recentTasks,
    recentNotifications,
  ] = await Promise.all([
    prisma.customer.count({ where: { organizationId } }),
    prisma.project.count({ where: { organizationId, status: 'ACTIVE' } }),
    prisma.task.count({ where: { organizationId, status: { not: 'DONE' } } }),
    prisma.task.count({
      where: { organizationId, status: { not: 'DONE' }, dueDate: { lt: now } },
    }),
    prisma.employee.count({ where: { organizationId, status: 'ACTIVE' } }),
    prisma.payment.aggregate({
      where: { invoice: { organizationId }, paidAt: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { invoice: { organizationId }, paidAt: { gte: lastMonthStart, lt: thisMonthStart } },
      _sum: { amount: true },
    }),
    prisma.task.findMany({
      where: { organizationId, status: { not: 'DONE' } },
      orderBy: [{ dueDate: 'asc' }],
      take: 5,
      include: { project: { select: { id: true, name: true } } },
    }),
    prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const thisMonthRevenue = Number(revenueThisMonth._sum.amount ?? 0);
  const lastMonthRevenue = Number(revenueLastMonth._sum.amount ?? 0);
  const revenueChangePct =
    lastMonthRevenue === 0 ? null : Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

  return {
    stats: {
      customers: customerCount,
      activeProjects: activeProjectCount,
      openTasks: openTaskCount,
      overdueTasks: overdueTaskCount,
      activeEmployees: employeeCount,
      revenueThisMonth: thisMonthRevenue,
      revenueLastMonth: lastMonthRevenue,
      revenueChangePct,
    },
    upcomingTasks: recentTasks,
    recentNotifications,
  };
}
