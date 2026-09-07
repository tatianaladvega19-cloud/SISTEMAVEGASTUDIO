import { formatCurrency } from "@/lib/utils/format";
import type { CategoryPerformanceReport } from "@/lib/utils/reports";

interface CategoryPerformanceProps {
  categories: CategoryPerformanceReport[];
}

export default function CategoryPerformance({ categories }: CategoryPerformanceProps) {
  const maxRevenue = Math.max(0, ...categories.map((category) => category.totalRevenue));

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-sm font-semibold text-ink">Ingresos por categoría</h3>

      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No hay servicios vendidos en el período seleccionado.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => {
            const widthPercent =
              maxRevenue === 0 ? 0 : (category.totalRevenue / maxRevenue) * 100;

            return (
              <li key={category.categoryId}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate text-sm font-medium text-ink">
                    {category.categoryName}
                  </p>
                  <p className="shrink-0 text-xs text-muted">
                    {category.quantitySold} servicio{category.quantitySold === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent-soft">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  />
                </div>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatCurrency(category.totalRevenue)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
