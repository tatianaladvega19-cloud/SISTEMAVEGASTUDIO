import PageHeader from "@/components/layout/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import CategoryOverview from "@/components/services/CategoryOverview";
import ServicesExplorer from "@/components/services/ServicesExplorer";
import { mockServices } from "@/lib/mocks/services";
import { mockServiceCategories } from "@/lib/mocks/service-categories";
import {
  getServiceMetrics,
  getCategoriesWithServiceCount,
  getServicesWithCategory,
} from "@/lib/utils/services";
import { formatCurrency } from "@/lib/utils/format";

export default function ServiciosPage() {
  const metrics = getServiceMetrics(mockServices, mockServiceCategories);
  const categories = getCategoriesWithServiceCount(mockServiceCategories, mockServices);
  const servicesWithCategory = getServicesWithCategory(
    mockServices,
    mockServiceCategories
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Servicios"
          description="Administra las categorías, servicios y precios de VEGA STUDIO."
        />
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo servicio
        </button>
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
        <h2 className="text-sm font-semibold text-ink">Categorías</h2>
        <div className="mt-3">
          <CategoryOverview categories={categories} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          Todos los servicios
        </h2>
        <ServicesExplorer
          services={servicesWithCategory}
          categories={mockServiceCategories}
        />
      </div>
    </div>
  );
}
