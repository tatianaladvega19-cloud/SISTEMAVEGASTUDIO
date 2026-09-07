import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import NewSaleForm from "@/components/sales/NewSaleForm";
import { getAllClients } from "@/lib/data/clients-store";
import { mockServices } from "@/lib/mocks/services";
import { mockServiceCategories } from "@/lib/mocks/service-categories";
import { getServicesWithCategory } from "@/lib/utils/services";

// Los clientes de la sesión y el catálogo de servicios pueden cambiar
// entre visitas (ver lib/data/clients-store.ts), así que esta página
// no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

export default function NuevaVentaPage() {
  const clients = getAllClients();
  const activeCategories = mockServiceCategories.filter(
    (category) => category.isActive
  );
  const activeServices = getServicesWithCategory(
    mockServices.filter((service) => service.isActive),
    mockServiceCategories
  );

  return (
    <div>
      <Link
        href="/ventas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a ventas
      </Link>

      <PageHeader
        title="Nueva venta"
        description="Selecciona un cliente, agrega los servicios y registra el pago."
      />

      <NewSaleForm
        clients={clients}
        services={activeServices}
        categories={activeCategories}
      />
    </div>
  );
}
