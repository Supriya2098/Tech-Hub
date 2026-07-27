import { useQuery } from '@tanstack/react-query';
import { getInsights } from './api';

export function useInsights() {
  return useQuery({ queryKey: ['ai-insights'], queryFn: getInsights });
}
