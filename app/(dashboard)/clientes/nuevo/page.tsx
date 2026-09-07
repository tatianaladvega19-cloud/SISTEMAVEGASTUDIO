import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import ClientForm from "@/components/clients/ClientForm";

export default function NuevoClientePage() {
  return (
    <div>
      <Link
        href="/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a clientes
      </Link>

      <PageHeader
        title="Nuevo cliente"
        description="Registra los datos de contacto de un nuevo cliente de VEGA STUDIO."
      />

      <ClientForm />
    </div>
  );
}
