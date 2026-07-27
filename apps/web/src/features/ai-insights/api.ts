import { api } from '@/lib/axios';

export interface Insight {
  id: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  description: string;
}

export async function getInsights(): Promise<Insight[]> {
  const { data } = await api.get('/ai-insights');
  return data.data;
}
