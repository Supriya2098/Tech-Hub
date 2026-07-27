import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '@/app/ThemeContext';
import { useAnalyticsOverview } from '../hooks';
import { StatusBreakdown } from '../components/StatusBreakdown';

const BRAND = '#5b88ff';

const taskStatusTone: Record<string, string> = {
  TODO: 'bg-slate-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-amber-400',
  DONE: 'bg-emerald-500',
};

const projectStatusTone: Record<string, string> = {
  PLANNING: 'bg-slate-400',
  ACTIVE: 'bg-emerald-500',
  ON_HOLD: 'bg-amber-400',
  COMPLETED: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
};

const invoiceStatusTone: Record<string, string> = {
  DRAFT: 'bg-slate-400',
  SENT: 'bg-blue-500',
  PAID: 'bg-emerald-500',
  OVERDUE: 'bg-red-500',
  VOID: 'bg-amber-400',
};

export function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useAnalyticsOverview();
  const { theme } = useTheme();
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    borderRadius: 8,
    borderColor: gridColor,
    fontSize: 12,
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState message="Failed to load analytics." onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title="Analytics" description="Trends across revenue, growth, and delivery over the last 6 months." />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2">
        <StatCard label="Task completion rate" value={`${data.taskCompletionRate}%`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Revenue collected by month</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="revenue" fill={BRAND} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">New customers by month</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.newCustomersByMonth}>
                <defs>
                  <linearGradient id="customerFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" name="New customers" stroke={BRAND} fill="url(#customerFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <StatusBreakdown title="Tasks by status" data={data.tasksByStatus} toneMap={taskStatusTone} />
        <StatusBreakdown title="Projects by status" data={data.projectsByStatus} toneMap={projectStatusTone} />
        <StatusBreakdown title="Invoices by status" data={data.invoicesByStatus} toneMap={invoiceStatusTone} />
      </div>
    </div>
  );
}
