import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { customersRouter } from './modules/customers/customers.routes';
import { employeesRouter } from './modules/employees/employees.routes';
import { projectsRouter } from './modules/projects/projects.routes';
import { tasksRouter } from './modules/tasks/tasks.routes';
import { financeRouter } from './modules/finance/finance.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { documentsRouter } from './modules/documents/documents.routes';
import { aiInsightsRouter } from './modules/ai-insights/ai-insights.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { settingsRouter } from './modules/settings/settings.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/tasks', tasksRouter);
apiRouter.use('/finance', financeRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/documents', documentsRouter);
apiRouter.use('/ai-insights', aiInsightsRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/settings', settingsRouter);
