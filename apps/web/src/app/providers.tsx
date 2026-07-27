import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ThemeProvider } from './ThemeContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
