import Link from "next/link";
import ServiceStatusBadge from "./ServiceStatusBadge";
import { formatCurrency } from "@/lib/utils/format";
import { toggleServiceActiveAction } from "@/app/(dashboard)/servicios/actions";
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
          <Link
            href={`/servicios/${service.id}/editar`}
            className="text-xs font-medium text-accent hover:underline"
          >
            Editar
          </Link>
          <form
            action={toggleServiceActiveAction.bind(
              null,
              service.id,
              !service.isActive
            )}
          >
            <button
              type="submit"
              className="text-xs font-medium text-muted hover:text-ink hover:underline"
            >
              {service.isActive ? "Desactivar" : "Activar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
