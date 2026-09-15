import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import SalesExplorer from "@/components/sales/SalesExplorer";
import { getAllSales, getAllSaleItems } from "@/lib/data/sales-store";
import { getAllClients } from "@/lib/data/clients-store";
import { mockUsers } from "@/lib/mocks/users";
import { getSalesWithDetails, getSalesMetrics } from "@/lib/utils/sales";
import { formatCurrency } from "@/lib/utils/format";

// Las ventas registradas en la sesión viven en memoria del servidor
// (ver lib/data/sales-store.ts), así que esta página no puede quedar
// cacheada de forma estática.
export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const sales = getAllSales();
  const saleItems = getAllSaleItems();
  const clients = await getAllClients();

  const metrics = getSalesMetrics(sales, saleItems);
  const salesWithDetails = getSalesWithDetails(
    sales,
    clients,
    mockUsers,
    saleItems
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Ventas"
          description="Registra y consulta las ventas realizadas en el salón."
        />
        <Link
          href="/ventas/nueva"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nueva venta
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ventas registradas"
          value={metrics.salesCount.toString()}
        />
        <MetricCard
          label="Ingresos totales"
          value={formatCurrency(metrics.totalRevenue)}
        />
        <MetricCard
          label="Servicios realizados"
          value={metrics.servicesSoldCount.toString()}
        />
        <MetricCard
          label="Ticket promedio"
          value={formatCurrency(metrics.averageTicket)}
        />
      </div>

      <div className="mt-8">
        <SalesExplorer sales={salesWithDetails} />
      </div>
    </div>
  );
}
