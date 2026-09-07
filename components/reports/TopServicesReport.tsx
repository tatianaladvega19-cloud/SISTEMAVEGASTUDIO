import DashboardCard from "@/components/dashboard/DashboardCard";
import { formatCurrency } from "@/lib/utils/format";
import type { TopServiceReport } from "@/lib/utils/reports";

interface TopServicesReportProps {
  services: TopServiceReport[];
}

export default function TopServicesReport({ services }: TopServicesReportProps) {
  const maxRevenue = Math.max(0, ...services.map((service) => service.totalRevenue));

  return (
    <DashboardCard title="Servicios más vendidos">
      {services.length === 0 ? (
        <p className="text-sm text-muted">
          No hay servicios vendidos en el período seleccionado.
        </p>
      ) : (
        <ul className="space-y-4">
          {services.map((service, index) => {
            const widthPercent =
              maxRevenue === 0 ? 0 : (service.totalRevenue / maxRevenue) * 100;

            return (
              <li key={service.serviceId}>
                <div className="flex items-center justify-between gap-4">
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
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent-soft">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}
