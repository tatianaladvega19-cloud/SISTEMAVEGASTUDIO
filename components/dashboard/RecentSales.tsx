import DashboardCard from "./DashboardCard";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/utils/format";
import type { SaleWithDetails } from "@/lib/utils/dashboard";

interface RecentSalesProps {
  sales: SaleWithDetails[];
}

export default function RecentSales({ sales }: RecentSalesProps) {
  return (
    <DashboardCard title="Últimas ventas">
      {sales.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay ventas registradas.</p>
      ) : (
        <ul className="divide-y divide-line">
          {sales.map((sale) => (
            <li
              key={sale.id}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {sale.clientName}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatDate(sale.createdAt)} ·{" "}
                  {formatPaymentMethod(sale.paymentMethod)}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {sale.items.map((item) => item.serviceName).join(", ")}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-ink">
                {formatCurrency(sale.total)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
