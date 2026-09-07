"use client";

import type { User } from "@/lib/types";
import type { PaymentMethodFilter } from "@/lib/utils/sales";
import { defaultReportFilters, type ReportFiltersState } from "@/lib/utils/reports";

interface ReportsFiltersProps {
  filters: ReportFiltersState;
  onChange: (filters: ReportFiltersState) => void;
  sellers: User[];
}

const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethodFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

const inputClassName =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export default function ReportsFilters({ filters, onChange, sellers }: ReportsFiltersProps) {
  const update = (partial: Partial<ReportFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const hasActiveFilters =
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.paymentMethod !== "all" ||
    filters.sellerId !== "all";

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Fecha desde
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(event) => update({ dateFrom: event.target.value })}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Fecha hasta
          </label>
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(event) => update({ dateTo: event.target.value })}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Método de pago
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(event) =>
              update({ paymentMethod: event.target.value as PaymentMethodFilter })
            }
            className={inputClassName}
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Vendedor
          </label>
          <select
            value={filters.sellerId}
            onChange={(event) => update({ sellerId: event.target.value })}
            className={inputClassName}
          >
            <option value="all">Todos</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={() => onChange(defaultReportFilters)}
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
