import Link from "next/link";
import SaleServicesList from "./SaleServicesList";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/utils/format";
import type { SaleWithClientDetails } from "@/lib/utils/sales";

interface SaleCardProps {
  sale: SaleWithClientDetails;
}

export default function SaleCard({ sale }: SaleCardProps) {
  return (
    <Link
      href={`/ventas/${sale.id}`}
      className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {sale.clientName}
          </p>
          <p className="mt-0.5 text-xs text-muted">{sale.clientCedula}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          {formatPaymentMethod(sale.paymentMethod)}
        </span>
      </div>

      <div className="mt-3 text-xs text-muted">
        <SaleServicesList items={sale.items} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
        <dt className="text-muted">Fecha</dt>
        <dd className="text-right text-ink">{formatDate(sale.createdAt)}</dd>
        <dt className="text-muted">Total</dt>
        <dd className="text-right font-semibold text-ink">
          {formatCurrency(sale.total)}
        </dd>
      </dl>

      <span className="mt-3 block text-right text-xs font-medium text-accent">
        Ver detalles →
      </span>
    </Link>
  );
}
