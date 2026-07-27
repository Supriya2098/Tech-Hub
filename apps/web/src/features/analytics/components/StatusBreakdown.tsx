import { Card, CardBody, CardHeader } from '@/components/ui/Card';

interface StatusBreakdownProps {
  title: string;
  data: Array<{ status: string; count: number }>;
  toneMap: Record<string, string>;
}

/** Renders a status-by-status breakdown as direct-labeled horizontal bars (no bare color-only legend). */
export function StatusBreakdown({ title, data, toneMap }: StatusBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        {data.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No data yet.</p>}
        {data.map((d) => (
          <div key={d.status}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{d.status.replace('_', ' ')}</span>
              <span className="text-slate-500 dark:text-slate-400">{d.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${toneMap[d.status] ?? 'bg-slate-400'}`}
                style={{ width: `${Math.max(4, (d.count / total) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
