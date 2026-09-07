import DashboardCard from "@/components/dashboard/DashboardCard";
import { formatCurrency } from "@/lib/utils/format";
import type { SellerPerformanceReport } from "@/lib/utils/reports";

interface SellerPerformanceProps {
  sellers: SellerPerformanceReport[];
}

export default function SellerPerformance({ sellers }: SellerPerformanceProps) {
  return (
    <DashboardCard title="Rendimiento por vendedor">
      {sellers.length === 0 ? (
        <p className="text-sm text-muted">
          No hay ventas registradas en el período seleccionado.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {sellers.map((seller) => (
            <li
              key={seller.sellerId}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {seller.sellerName}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {seller.salesCount} venta{seller.salesCount === 1 ? "" : "s"} · ticket
                  promedio {formatCurrency(seller.averageTicket)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-ink">
                {formatCurrency(seller.totalRevenue)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
