import { prisma } from '../../lib/prisma';

export type InsightSeverity = 'info' | 'success' | 'warning' | 'alert';

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
}

/**
 * Deterministic rules/statistics engine over the org's own data.
 * No external LLM call is required to run this module; it is intentionally
 * built as an extension point - swap the rule functions below for a real
 * LLM-generated summary later without touching the route/controller layer.
 */
export async function generateInsights(organizationId: string): Promise<Insight[]> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [openTasks, overdueTasks, employees, thisMonthPayments, lastMonthPayments, topCustomers, overdueInvoices, staleActiveProjects] =
    await Promise.all([
      prisma.task.count({ where: { organizationId, status: { not: 'DONE' } } }),
      prisma.task.count({ where: { organizationId, status: { not: 'DONE' }, dueDate: { lt: now } } }),
      prisma.employee.findMany({
        where: { organizationId, status: 'ACTIVE' },
        include: { _count: { select: { tasks: true } } },
      }),
      prisma.payment.aggregate({
        where: { invoice: { organizationId }, paidAt: { gte: thisMonthStart } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { invoice: { organizationId }, paidAt: { gte: lastMonthStart, lt: thisMonthStart } },
        _sum: { amount: true },
      }),
      prisma.invoice.groupBy({
        by: ['customerId'],
        where: { organizationId, status: 'PAID' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 3,
      }),
      prisma.invoice.count({
        where: { organizationId, status: { in: ['SENT', 'OVERDUE'] }, dueAt: { lt: now } },
      }),
      prisma.project.count({
        where: { organizationId, status: 'ACTIVE', tasks: { none: {} } },
      }),
    ]);

  const insights: Insight[] = [];

  // 1. Overdue task ratio
  if (openTasks > 0) {
    const overdueRatio = overdueTasks / openTasks;
    if (overdueRatio > 0.2) {
      insights.push({
        id: 'overdue-tasks',
        severity: overdueRatio > 0.4 ? 'alert' : 'warning',
        title: 'A significant share of tasks are overdue',
        description: `${overdueTasks} of ${openTasks} open tasks (${Math.round(overdueRatio * 100)}%) are past their due date. Consider re-prioritizing or reassigning work.`,
      });
    }
  }

  // 2. Revenue trend
  const thisMonthRevenue = Number(thisMonthPayments._sum.amount ?? 0);
  const lastMonthRevenue = Number(lastMonthPayments._sum.amount ?? 0);
  if (lastMonthRevenue > 0) {
    const changePct = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
    if (changePct <= -15) {
      insights.push({
        id: 'revenue-decline',
        severity: 'warning',
        title: 'Revenue is trending down',
        description: `Collected revenue is down ${Math.abs(changePct)}% compared to last month (₹${thisMonthRevenue.toLocaleString('en-IN')} vs ₹${lastMonthRevenue.toLocaleString('en-IN')}).`,
      });
    } else if (changePct >= 15) {
      insights.push({
        id: 'revenue-growth',
        severity: 'success',
        title: 'Revenue is trending up',
        description: `Collected revenue is up ${changePct}% compared to last month (₹${thisMonthRevenue.toLocaleString('en-IN')} vs ₹${lastMonthRevenue.toLocaleString('en-IN')}).`,
      });
    }
  } else if (thisMonthRevenue > 0) {
    insights.push({
      id: 'revenue-first-month',
      severity: 'info',
      title: 'Revenue collected this month',
      description: `You've collected ₹${thisMonthRevenue.toLocaleString('en-IN')} so far this month.`,
    });
  }

  // 3. Employee workload imbalance
  if (employees.length >= 2) {
    const counts = employees.map((e) => e._count.tasks);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const max = Math.max(...counts);
    if (avg > 0 && max > avg * 2) {
      const busiest = employees.find((e) => e._count.tasks === max);
      insights.push({
        id: 'workload-imbalance',
        severity: 'warning',
        title: 'Uneven task workload across the team',
        description: `${busiest?.name ?? 'One employee'} has ${max} tasks assigned, more than double the team average of ${avg.toFixed(1)}. Consider redistributing work.`,
      });
    }
  }

  // 4. Top customers by revenue
  if (topCustomers.length > 0) {
    const customerIds = topCustomers.map((c) => c.customerId);
    const customers = await prisma.customer.findMany({ where: { id: { in: customerIds } } });
    const names = topCustomers
      .map((c) => customers.find((cust) => cust.id === c.customerId)?.name)
      .filter(Boolean)
      .join(', ');
    if (names) {
      insights.push({
        id: 'top-customers',
        severity: 'info',
        title: 'Your top customers by revenue',
        description: `Your highest-paying customers are: ${names}.`,
      });
    }
  }

  // 5. Overdue invoices
  if (overdueInvoices > 0) {
    insights.push({
      id: 'overdue-invoices',
      severity: 'alert',
      title: 'Overdue invoices need attention',
      description: `${overdueInvoices} invoice(s) are past their due date and unpaid. Follow up with these customers to protect cash flow.`,
    });
  }

  // 6. Stale active projects
  if (staleActiveProjects > 0) {
    insights.push({
      id: 'stale-projects',
      severity: 'warning',
      title: 'Active projects with no tasks',
      description: `${staleActiveProjects} project(s) are marked ACTIVE but have no tasks yet. Add tasks to keep work moving and trackable.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'all-clear',
      severity: 'success',
      title: 'Everything looks healthy',
      description: 'No risk signals were detected in your current tasks, projects, or invoices.',
    });
  }

  return insights;
}
