import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
