import { Users, FolderKanban, ListChecks, AlertTriangle, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatINR } from '@/lib/currency';
import { useDashboardSummary } from '../hooks';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState message="Failed to load dashboard data." onRetry={() => refetch()} />;

  const { stats, upcomingTasks, recentNotifications } = data;

  return (
    <div>
      <PageHeader title="Dashboard" description="A snapshot of how your business is running today." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Customers" value={stats.customers.toString()} icon={Users} />
        <StatCard label="Active projects" value={stats.activeProjects.toString()} icon={FolderKanban} />
        <StatCard label="Open tasks" value={stats.openTasks.toString()} icon={ListChecks} />
        <StatCard
          label="Overdue tasks"
          value={stats.overdueTasks.toString()}
          icon={AlertTriangle}
          hint={stats.overdueTasks > 0 ? 'Needs attention' : undefined}
        />
        <StatCard
          label="Revenue this month"
          value={formatINR(stats.revenueThisMonth)}
          icon={DollarSign}
          hint={stats.revenueChangePct !== null ? `${stats.revenueChangePct >= 0 ? '+' : ''}${stats.revenueChangePct}% vs last month` : undefined}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upcoming tasks</h2>
          </CardHeader>
          <CardBody>
            {upcomingTasks.length === 0 ? (
              <EmptyState title="Nothing due soon" />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.project.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge tone={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'red' : 'slate'}>
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent activity</h2>
          </CardHeader>
          <CardBody>
            {recentNotifications.length === 0 ? (
              <EmptyState title="No activity yet" />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentNotifications.map((n) => (
                  <li key={n.id} className="py-2.5">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
