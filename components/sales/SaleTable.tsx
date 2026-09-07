import Link from "next/link";
import SaleCard from "./SaleCard";
import SaleServicesList from "./SaleServicesList";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/utils/format";
import type { SaleWithClientDetails } from "@/lib/utils/sales";

interface SaleTableProps {
  sales: SaleWithClientDetails[];
}

export default function SaleTable({ sales }: SaleTableProps) {
  if (sales.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="text-sm font-medium text-ink">No se encontraron ventas</p>
        <p className="mt-1 text-sm text-muted">
          Ajusta la búsqueda o los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {sales.map((sale) => (
          <SaleCard key={sale.id} sale={sale} />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Servicios</th>
              <th className="px-5 py-3 font-medium">Método de pago</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-background/60">
                <td className="px-5 py-3">
                  <p className="font-medium text-ink">{sale.clientName}</p>
                  <p className="text-xs text-muted">{sale.clientCedula}</p>
                </td>
                <td className="px-5 py-3 text-muted">
                  <SaleServicesList items={sale.items} />
                </td>
                <td className="px-5 py-3 text-muted">
                  {formatPaymentMethod(sale.paymentMethod)}
                </td>
                <td className="px-5 py-3 font-medium text-ink">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(sale.createdAt)}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/ventas/${sale.id}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Ver detalles
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
