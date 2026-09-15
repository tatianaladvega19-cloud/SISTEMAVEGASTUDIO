import Link from "next/link";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { formatClientSource, formatDate } from "@/lib/utils/format";
import type { Client } from "@/lib/types";

interface ClientInfoCardProps {
  client: Client;
}

export default function ClientInfoCard({ client }: ClientInfoCardProps) {
  const fields: Array<{ label: string; value?: string }> = [
    { label: "Cédula", value: client.cedula },
    { label: "Teléfono", value: client.phone },
    { label: "Email", value: client.email },
    { label: "Dirección", value: client.address },
    { label: "Fuente de adquisición", value: formatClientSource(client.source) },
    { label: "Fecha de registro", value: formatDate(client.createdAt) },
  ];

  return (
    <DashboardCard title="Información general">
      <div className="mb-4 flex justify-end">
        <Link
          href={`/clientes/${client.id}/editar`}
          className="text-sm font-medium text-accent hover:underline"
        >
          Editar
        </Link>
      </div>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(
          (field) =>
            field.value && (
              <div key={field.label}>
                <dt className="text-xs text-muted">{field.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {field.value}
                </dd>
              </div>
            )
        )}
      </dl>
    </DashboardCard>
  );
}
