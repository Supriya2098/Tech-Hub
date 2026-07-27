import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '../hooks';
import type { Notification } from '../api';

const typeTone: Record<Notification['type'], 'slate' | 'green' | 'yellow' | 'red'> = {
  INFO: 'slate',
  SUCCESS: 'green',
  WARNING: 'yellow',
  ALERT: 'red',
};

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useNotifications({ page, limit: 15 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="System activity across tasks, invoices, and your team."
        action={
          <Button variant="secondary" onClick={() => markAllAsRead.mutate()} isLoading={markAllAsRead.isPending}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Failed to load notifications." onRetry={() => refetch()} />}
      {!isLoading && !isError && data && data.data.length === 0 && <EmptyState title="No notifications yet" />}
      {!isLoading && !isError && data && data.data.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {data.data.map((n) => (
              <Card key={n.id} className={n.isRead ? 'opacity-70' : undefined}>
                <CardBody className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <Badge tone={typeTone[n.type]}>{n.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(n.id)}>
                      Mark read
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
