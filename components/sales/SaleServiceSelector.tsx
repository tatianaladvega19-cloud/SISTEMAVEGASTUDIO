"use client";

import { useMemo, useState } from "react";
import { IconPlus } from "@/components/layout/icons";
import { filterServices, type ServiceWithCategory } from "@/lib/utils/services";
import { formatCurrency } from "@/lib/utils/format";
import type { ServiceCategory } from "@/lib/types";

interface SaleServiceSelectorProps {
  /** Ya viene filtrado a solo servicios activos (ver page.tsx). */
  services: ServiceWithCategory[];
  categories: ServiceCategory[];
  onAdd: (service: ServiceWithCategory) => void;
  error?: string;
}

export default function SaleServiceSelector({
  services,
  categories,
  onAdd,
  error,
}: SaleServiceSelectorProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const filteredServices = useMemo(
    () => filterServices(services, { search, categoryId, status: "all" }),
    [services, search, categoryId]
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="15.3" y1="15.3" x2="20" y2="20" />
          </svg>
          <input
            type="text"
            inputMode="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar servicio por nombre..."
            className="w-full rounded-lg border border-line bg-background py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-lg border border-line bg-background px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:w-56"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {filteredServices.length === 0 && (
          <p className="px-1 py-2 text-sm text-muted">
            No se encontraron servicios activos con ese criterio.
          </p>
        )}
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {service.name}
              </p>
              <p className="text-xs text-muted">{service.categoryName}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-semibold text-ink">
                {formatCurrency(service.price)}
              </span>
              <button
                type="button"
                onClick={() => onAdd(service)}
                className="inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <IconPlus className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
