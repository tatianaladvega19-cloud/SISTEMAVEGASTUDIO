import type { SalesByDatePoint } from "@/lib/utils/reports";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface SalesPerformanceChartProps {
  points: SalesByDatePoint[];
}

export default function SalesPerformanceChart({ points }: SalesPerformanceChartProps) {
  const maxRevenue = Math.max(0, ...points.map((point) => point.revenue));

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">Rendimiento de ventas</h3>
      <p className="mt-1 text-sm text-muted">
        Comportamiento de los ingresos registrados.
      </p>

      {points.length === 0 ? (
        <p className="mt-6 py-10 text-center text-sm text-muted">
          No hay ventas registradas en el período seleccionado.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <div className="flex h-56 min-w-full items-end gap-2 sm:gap-3">
            {points.map((point) => {
              const heightPercent =
                maxRevenue === 0 ? 0 : (point.revenue / maxRevenue) * 100;

              return (
                <div
                  key={point.dateKey}
                  className="group relative flex h-full min-w-[36px] flex-1 flex-col items-center justify-end"
                >
                  <div className="pointer-events-none absolute bottom-full mb-2 hidden -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:flex group-hover:opacity-100 left-1/2">
                    <span className="font-semibold">{formatCurrency(point.revenue)}</span>
                    <span className="text-white/70">
                      {point.salesCount} venta{point.salesCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div
                    className="w-full rounded-t-md bg-accent transition-colors group-hover:bg-ink"
                    style={{ height: `${Math.max(heightPercent, 3)}%` }}
                  />

                  <span className="mt-2 max-w-[48px] truncate text-[10px] text-muted">
                    {formatDate(point.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
