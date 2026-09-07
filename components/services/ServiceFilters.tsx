"use client";

import type { ServiceCategory } from "@/lib/types";
import type { ServiceStatusFilter } from "@/lib/utils/services";

interface ServiceFiltersProps {
  categories: ServiceCategory[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  status: ServiceStatusFilter;
  onStatusChange: (status: ServiceStatusFilter) => void;
}

const STATUS_OPTIONS: Array<{ value: ServiceStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

export default function ServiceFilters({
  categories,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
}: ServiceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <select
        value={categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:w-56"
      >
        <option value="all">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <div className="inline-flex rounded-lg border border-line bg-surface p-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              status === option.value
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
