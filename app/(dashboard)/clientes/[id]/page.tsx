import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import ClientInfoCard from "@/components/clients/ClientInfoCard";
import ClientHistory from "@/components/clients/ClientHistory";
import { getClientById } from "@/lib/data/clients-store";
import { mockSales, mockSaleItems } from "@/lib/mocks/sales";
import { getClientSalesHistory, getClientSummary } from "@/lib/utils/clients";
import { formatCurrency } from "@/lib/utils/format";

// Un cliente creado en la sesión actual solo existe en memoria del
// servidor (ver lib/data/clients-store.ts), así que esta página no
// puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

interface ClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientePage({ params }: ClientePageProps) {
  const { id } = await params;

  const client = getClientById(id);

  if (!client) {
    notFound();
  }

  const salesHistory = getClientSalesHistory(client.id, mockSales, mockSaleItems);
  const summary = getClientSummary(salesHistory);

  return (
    <div>
      <Link
        href="/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a clientes
      </Link>

      <PageHeader
        title={client.fullName}
        description="Resumen del historial y datos de contacto del cliente."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Visitas / ventas"
          value={summary.visitsCount.toString()}
        />
        <MetricCard
          label="Total invertido"
          value={formatCurrency(summary.totalSpent)}
        />
        <MetricCard
          label="Servicios realizados"
          value={summary.servicesCount.toString()}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClientInfoCard client={client} />
        <ClientHistory sales={salesHistory} />
      </div>
    </div>
  );
}
