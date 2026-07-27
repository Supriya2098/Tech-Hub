import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from './api';

export function useAnalyticsOverview() {
  return useQuery({ queryKey: ['analytics', 'overview'], queryFn: getAnalyticsOverview });
}
