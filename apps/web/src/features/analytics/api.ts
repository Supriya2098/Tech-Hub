import { api } from '@/lib/axios';

export interface AnalyticsOverview {
  revenueByMonth: Array<{ month: string; revenue: number }>;
  newCustomersByMonth: Array<{ month: string; count: number }>;
  tasksByStatus: Array<{ status: string; count: number }>;
  projectsByStatus: Array<{ status: string; count: number }>;
  invoicesByStatus: Array<{ status: string; count: number }>;
  taskCompletionRate: number;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await api.get('/analytics/overview');
  return data.data;
}
