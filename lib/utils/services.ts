// Cálculos, relaciones y filtros derivados para el módulo de
// Servicios. Reciben los datos como parámetros (mismo patrón que
// lib/utils/dashboard.ts y lib/utils/clients.ts) para que sigan
// funcionando igual el día que los datos vengan de una API real.

import type { Service, ServiceCategory } from "../types";

// ---------------------------------------------------------------------------
// Relación Service <-> ServiceCategory
// ---------------------------------------------------------------------------

export interface ServiceWithCategory extends Service {
  categoryName: string;
}

export function getServicesWithCategory(
  services: Service[],
  categories: ServiceCategory[]
): ServiceWithCategory[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  return services.map((service) => ({
    ...service,
    categoryName: categoriesById.get(service.categoryId)?.name ?? "Sin categoría",
  }));
}

export interface CategoryWithServiceCount extends ServiceCategory {
  servicesCount: number;
}

export function getCategoriesWithServiceCount(
  categories: ServiceCategory[],
  services: Service[]
): CategoryWithServiceCount[] {
  return categories.map((category) => ({
    ...category,
    servicesCount: services.filter((service) => service.categoryId === category.id)
      .length,
  }));
}

// ---------------------------------------------------------------------------
// Métricas del resumen superior
// ---------------------------------------------------------------------------

export interface ServiceMetrics {
  activeCategoriesCount: number;
  activeServicesCount: number;
  inactiveServicesCount: number;
  averageActivePrice: number;
}

export function getServiceMetrics(
  services: Service[],
  categories: ServiceCategory[]
): ServiceMetrics {
  const activeServices = services.filter((service) => service.isActive);

  return {
    activeCategoriesCount: categories.filter((category) => category.isActive).length,
    activeServicesCount: activeServices.length,
    inactiveServicesCount: services.length - activeServices.length,
    averageActivePrice:
      activeServices.length === 0
        ? 0
        : activeServices.reduce((sum, service) => sum + service.price, 0) /
          activeServices.length,
  };
}

// ---------------------------------------------------------------------------
// Filtros del listado de servicios
// ---------------------------------------------------------------------------

export type ServiceStatusFilter = "all" | "active" | "inactive";

export interface ServiceFiltersState {
  search: string;
  categoryId: string;
  status: ServiceStatusFilter;
}

export const defaultServiceFilters: ServiceFiltersState = {
  search: "",
  categoryId: "all",
  status: "all",
};

export function filterServices(
  services: ServiceWithCategory[],
  filters: ServiceFiltersState
): ServiceWithCategory[] {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return services.filter((service) => {
    if (normalizedSearch && !service.name.toLowerCase().includes(normalizedSearch)) {
      return false;
    }
    if (filters.categoryId !== "all" && service.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.status === "active" && !service.isActive) return false;
    if (filters.status === "inactive" && service.isActive) return false;

    return true;
  });
}
