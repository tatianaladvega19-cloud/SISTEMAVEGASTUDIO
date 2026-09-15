import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import ClientsExplorer from "@/components/clients/ClientsExplorer";
import { getAllClients } from "@/lib/data/clients-store";

// Los clientes creados en la sesión viven en memoria del servidor
// (ver lib/data/clients-store.ts), así que esta página no puede
// quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await getAllClients();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Clientes"
          description="Gestiona y consulta la información de tus clientes."
        />
        <Link
          href="/clientes/nuevo"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo cliente
        </Link>
      </div>

      <ClientsExplorer clients={clients} />
    </div>
  );
}
