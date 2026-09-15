import Link from "next/link";
import ServiceCard from "./ServiceCard";
import ServiceStatusBadge from "./ServiceStatusBadge";
import { formatCurrency } from "@/lib/utils/format";
import { toggleServiceActiveAction } from "@/app/(dashboard)/servicios/actions";
import type { ServiceWithCategory } from "@/lib/utils/services";

interface ServicesTableProps {
  services: ServiceWithCategory[];
}

export default function ServicesTable({ services }: ServicesTableProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="text-sm font-medium text-ink">
          No se encontraron servicios
        </p>
        <p className="mt-1 text-sm text-muted">
          Ajusta la búsqueda o los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Servicio</th>
              <th className="px-5 py-3 font-medium">Categoría</th>
              <th className="px-5 py-3 font-medium">Descripción</th>
              <th className="px-5 py-3 font-medium">Precio</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-background/60">
                <td className="px-5 py-3 font-medium text-ink">{service.name}</td>
                <td className="px-5 py-3 text-muted">{service.categoryName}</td>
                <td className="max-w-xs px-5 py-3 text-muted">
                  {service.description ?? "—"}
                </td>
                <td className="px-5 py-3 font-medium text-ink">
                  {formatCurrency(service.price)}
                </td>
                <td className="px-5 py-3">
                  <ServiceStatusBadge isActive={service.isActive} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/servicios/${service.id}/editar`}
                      className="text-sm font-medium text-accent hover:underline"
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
                        className="text-sm font-medium text-muted hover:text-ink hover:underline"
                      >
                        {service.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
