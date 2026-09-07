import DashboardCard from "./DashboardCard";
import { formatDateTime } from "@/lib/utils/format";
import type { ActivityWithUser } from "@/lib/utils/dashboard";

interface RecentActivityProps {
  logs: ActivityWithUser[];
}

export default function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <DashboardCard title="Actividad reciente">
      {logs.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay actividad registrada.</p>
      ) : (
        <ul className="divide-y divide-line">
          {logs.map((log) => (
            <li key={log.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm text-ink">{log.description}</p>
              <p className="mt-0.5 text-xs text-muted">
                {log.userName} · {formatDateTime(log.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
