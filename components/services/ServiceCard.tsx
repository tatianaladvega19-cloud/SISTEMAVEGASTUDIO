import ServiceStatusBadge from "./ServiceStatusBadge";
import { formatCurrency } from "@/lib/utils/format";
import type { ServiceWithCategory } from "@/lib/utils/services";

interface ServiceCardProps {
  service: ServiceWithCategory;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{service.name}</p>
          <p className="mt-0.5 text-xs text-muted">{service.categoryName}</p>
        </div>
        <ServiceStatusBadge isActive={service.isActive} />
      </div>

      {service.description && (
        <p className="mt-2 text-xs text-muted">{service.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          {formatCurrency(service.price)}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-xs font-medium text-accent hover:underline"
          >
            Editar
          </button>
          <button
            type="button"
            className="text-xs font-medium text-muted hover:text-ink hover:underline"
          >
            {service.isActive ? "Desactivar" : "Activar"}
          </button>
        </div>
      </div>
    </div>
  );
}
