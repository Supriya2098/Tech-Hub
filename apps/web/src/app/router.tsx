import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { EmployeesPage } from '@/features/employees/pages/EmployeesPage';
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage';
import { TasksPage } from '@/features/tasks/pages/TasksPage';
import { FinancePage } from '@/features/finance/pages/FinancePage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { DocumentsPage } from '@/features/documents/pages/DocumentsPage';
import { AiInsightsPage } from '@/features/ai-insights/pages/AiInsightsPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/ai-insights" element={<AiInsightsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
