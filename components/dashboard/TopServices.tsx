import DashboardCard from "./DashboardCard";
import { formatCurrency } from "@/lib/utils/format";
import type { TopService } from "@/lib/utils/dashboard";

interface TopServicesProps {
  services: TopService[];
}

export default function TopServices({ services }: TopServicesProps) {
  return (
    <DashboardCard title="Servicios más vendidos">
      {services.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay servicios vendidos.</p>
      ) : (
        <ul className="divide-y divide-line">
          {services.map((service, index) => (
            <li
              key={service.serviceId}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {service.serviceName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {service.quantitySold} vendidos
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold text-ink">
                {formatCurrency(service.totalRevenue)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
