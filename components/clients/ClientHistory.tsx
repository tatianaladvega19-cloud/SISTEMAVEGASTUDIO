import DashboardCard from "@/components/dashboard/DashboardCard";
import {
  formatCurrency,
  formatDate,
  formatPaymentMethod,
} from "@/lib/utils/format";
import type { ClientSaleWithItems } from "@/lib/utils/clients";

interface ClientHistoryProps {
  sales: ClientSaleWithItems[];
}

export default function ClientHistory({ sales }: ClientHistoryProps) {
  return (
    <DashboardCard title="Historial de ventas">
      {sales.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm font-medium text-ink">
            Este cliente todavía no tiene ventas registradas
          </p>
          <p className="mt-1 text-sm text-muted">
            El historial aparecerá aquí en cuanto se registre su primera venta.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {sales.map((sale) => (
            <li
              key={sale.id}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {formatDate(sale.createdAt)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {sale.items.map((item) => item.serviceName).join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {formatPaymentMethod(sale.paymentMethod)}
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
