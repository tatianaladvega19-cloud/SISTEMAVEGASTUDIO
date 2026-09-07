import DashboardCard from "./DashboardCard";
import { formatClientSource } from "@/lib/utils/format";
import type { Client } from "@/lib/types";

interface RecentClientsProps {
  clients: Client[];
}

export default function RecentClients({ clients }: RecentClientsProps) {
  return (
    <DashboardCard title="Clientes recientes">
      {clients.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay clientes registrados.</p>
      ) : (
        <ul className="divide-y divide-line">
          {clients.map((client) => (
            <li
              key={client.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {client.fullName}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {client.cedula} · {client.phone}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                {formatClientSource(client.source)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
