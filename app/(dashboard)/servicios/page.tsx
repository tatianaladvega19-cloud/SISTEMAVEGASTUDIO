import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import CategoryOverview from "@/components/services/CategoryOverview";
import ServicesExplorer from "@/components/services/ServicesExplorer";
import {
  getAllServices,
  getAllServiceCategories,
} from "@/lib/data/services-store";
import {
  getServiceMetrics,
  getCategoriesWithServiceCount,
  getServicesWithCategory,
} from "@/lib/utils/services";
import { formatCurrency } from "@/lib/utils/format";

// Los servicios y categorías viven en Supabase y pueden cambiar entre
// sesiones, así que esta página no puede quedar cacheada de forma
// estática (mismo criterio que app/(dashboard)/clientes/page.tsx).
export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const [services, categories] = await Promise.all([
    getAllServices(),
    getAllServiceCategories(),
  ]);

  const metrics = getServiceMetrics(services, categories);
  const categoriesWithCount = getCategoriesWithServiceCount(categories, services);
  const servicesWithCategory = getServicesWithCategory(services, categories);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Servicios"
          description="Administra las categorías, servicios y precios de VEGA STUDIO."
        />
        <Link
          href="/servicios/nuevo"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo servicio
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Categorías activas"
          value={metrics.activeCategoriesCount.toString()}
        />
        <MetricCard
          label="Servicios activos"
          value={metrics.activeServicesCount.toString()}
        />
        <MetricCard
          label="Servicios inactivos"
          value={metrics.inactiveServicesCount.toString()}
        />
        <MetricCard
          label="Precio promedio (activos)"
          value={formatCurrency(metrics.averageActivePrice)}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Categorías</h2>
          <Link
            href="/servicios/categorias/nueva"
            className="text-sm font-medium text-accent hover:underline"
          >
            + Nueva categoría
          </Link>
        </div>
        <div className="mt-3">
          <CategoryOverview categories={categoriesWithCount} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          Todos los servicios
        </h2>
        <ServicesExplorer
          services={servicesWithCategory}
          categories={categories}
        />
      </div>
    </div>
  );
}
