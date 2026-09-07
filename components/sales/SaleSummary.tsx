import { formatCurrency } from "@/lib/utils/format";
import type { DraftSaleSummary } from "@/lib/utils/sales";

interface SaleSummaryProps {
  summary: DraftSaleSummary;
}

export default function SaleSummary({ summary }: SaleSummaryProps) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <dt className="text-muted">Servicios agregados</dt>
        <dd className="font-medium text-ink">{summary.servicesCount}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="font-medium text-ink">
          {formatCurrency(summary.subtotal)}
        </dd>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-2 text-base">
        <dt className="font-semibold text-ink">Total</dt>
        <dd className="font-semibold text-ink">
          {formatCurrency(summary.total)}
        </dd>
      </div>
    </dl>
  );
}
