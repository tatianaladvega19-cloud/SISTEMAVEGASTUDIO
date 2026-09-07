"use client";

import { IconMinus, IconPlus, IconTrash } from "@/components/layout/icons";
import { formatCurrency } from "@/lib/utils/format";
import type { DraftSaleItem } from "@/lib/utils/sales";

interface SaleItemsListProps {
  items: DraftSaleItem[];
  onIncrement: (serviceId: string) => void;
  onDecrement: (serviceId: string) => void;
  onRemove: (serviceId: string) => void;
  error?: string;
}

export default function SaleItemsList({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  error,
}: SaleItemsListProps) {
  if (items.length === 0) {
    return (
      <div
        className={`rounded-lg border border-dashed p-6 text-center ${
          error ? "border-red-300" : "border-line"
        }`}
      >
        <p className="text-sm font-medium text-ink">
          Aún no has agregado servicios
        </p>
        <p className="mt-1 text-sm text-muted">
          Busca un servicio arriba y agrégalo a la venta.
        </p>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.serviceId}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {item.serviceName}
            </p>
            <p className="text-xs text-muted">
              {formatCurrency(item.unitPrice)} c/u
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="inline-flex items-center rounded-lg border border-line">
              <button
                type="button"
                onClick={() => onDecrement(item.serviceId)}
                disabled={item.quantity <= 1}
                className="p-2 text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Disminuir cantidad de ${item.serviceName}`}
              >
                <IconMinus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-ink">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrement(item.serviceId)}
                className="p-2 text-muted transition-colors hover:text-ink"
                aria-label={`Aumentar cantidad de ${item.serviceName}`}
              >
                <IconPlus className="h-3.5 w-3.5" />
              </button>
            </div>

            <span className="w-20 shrink-0 text-right text-sm font-semibold text-ink">
              {formatCurrency(item.unitPrice * item.quantity)}
            </span>

            <button
              type="button"
              onClick={() => onRemove(item.serviceId)}
              className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:text-red-600"
              aria-label={`Eliminar ${item.serviceName} de la venta`}
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
