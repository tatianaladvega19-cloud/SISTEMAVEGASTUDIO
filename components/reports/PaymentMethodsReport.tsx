import DashboardCard from "@/components/dashboard/DashboardCard";
import { formatCurrency, formatPaymentMethod } from "@/lib/utils/format";
import type { PaymentMethodReport } from "@/lib/utils/reports";

interface PaymentMethodsReportProps {
  methods: PaymentMethodReport[];
}

export default function PaymentMethodsReport({ methods }: PaymentMethodsReportProps) {
  return (
    <DashboardCard title="Métodos de pago">
      {methods.length === 0 ? (
        <p className="text-sm text-muted">
          No hay ventas registradas en el período seleccionado.
        </p>
      ) : (
        <ul className="space-y-4">
          {methods.map((method) => (
            <li key={method.method}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-medium text-ink">
                  {formatPaymentMethod(method.method)}
                </p>
                <p className="shrink-0 text-xs text-muted">
                  {method.count} venta{method.count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent-soft">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(method.percentage, 2)}%` }}
                  />
                </div>
                <p className="w-12 shrink-0 text-right text-xs text-muted">
                  {method.percentage.toFixed(0)}%
                </p>
              </div>
              <p className="mt-1 text-sm font-semibold text-ink">
                {formatCurrency(method.revenue)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
