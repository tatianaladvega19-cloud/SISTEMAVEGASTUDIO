"use client";

import { useMemo, useState } from "react";
import ServiceSearch from "./ServiceSearch";
import ServiceFilters from "./ServiceFilters";
import ServicesTable from "./ServicesTable";
import {
  filterServices,
  defaultServiceFilters,
  type ServiceStatusFilter,
  type ServiceWithCategory,
} from "@/lib/utils/services";
import type { ServiceCategory } from "@/lib/types";

interface ServicesExplorerProps {
  services: ServiceWithCategory[];
  categories: ServiceCategory[];
}

export default function ServicesExplorer({
  services,
  categories,
}: ServicesExplorerProps) {
  const [filters, setFilters] = useState(defaultServiceFilters);

  const filteredServices = useMemo(
    () => filterServices(services, filters),
    [services, filters]
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-sm sm:flex-1">
          <ServiceSearch
            value={filters.search}
            onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          />
        </div>
        <ServiceFilters
          categories={categories}
          categoryId={filters.categoryId}
          onCategoryChange={(categoryId) =>
            setFilters((prev) => ({ ...prev, categoryId }))
          }
          status={filters.status}
          onStatusChange={(status: ServiceStatusFilter) =>
            setFilters((prev) => ({ ...prev, status }))
          }
        />
      </div>

      <p className="mt-3 text-sm text-muted">
        {filteredServices.length} de {services.length} servicio
        {services.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4">
        <ServicesTable services={filteredServices} />
      </div>
    </div>
  );
}
