import { api } from '@/lib/axios';

export interface DashboardSummary {
  stats: {
    customers: number;
    activeProjects: number;
    openTasks: number;
    overdueTasks: number;
    activeEmployees: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueChangePct: number | null;
  };
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string | null;
    priority: string;
    project: { id: string; name: string };
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get('/dashboard/summary');
  return data.data;
}
