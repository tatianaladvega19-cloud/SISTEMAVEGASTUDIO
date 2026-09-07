import Link from "next/link";
import { formatClientSource, formatDate } from "@/lib/utils/format";
import type { Client } from "@/lib/types";

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  return (
    <Link
      href={`/clientes/${client.id}`}
      className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {client.fullName}
          </p>
          <p className="mt-0.5 text-xs text-muted">{client.cedula}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          {formatClientSource(client.source)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
        <dt className="text-muted">Teléfono</dt>
        <dd className="text-right text-ink">{client.phone}</dd>
        <dt className="text-muted">Registrado</dt>
        <dd className="text-right text-ink">{formatDate(client.createdAt)}</dd>
      </dl>

      <span className="mt-3 block text-right text-xs font-medium text-accent">
        Ver detalles →
      </span>
    </Link>
  );
}
