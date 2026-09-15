import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ClientForm from "@/components/clients/ClientForm";
import { getClientById } from "@/lib/data/clients-store";
import { updateClientAction } from "./actions";
import { getInitialEditClientState } from "./form-state";

// El cliente puede haber cambiado desde otra sesión (ver
// lib/data/clients-store.ts, ahora respaldado por Supabase), así que
// esta página no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

interface EditarClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({
  params,
}: EditarClientePageProps) {
  const { id } = await params;

  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/clientes/${client.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver al cliente
      </Link>

      <PageHeader
        title={`Editar ${client.fullName}`}
        description="Actualiza los datos de contacto y la fuente de adquisición del cliente."
      />

      <div className="mt-6">
        <ClientForm
          client={client}
          action={updateClientAction.bind(null, client.id)}
          initialState={getInitialEditClientState(client)}
        />
      </div>
    </div>
  );
}
