import Link from "next/link";
import ClientCard from "./ClientCard";
import { formatClientSource, formatDate } from "@/lib/utils/format";
import type { Client } from "@/lib/types";

interface ClientTableProps {
  clients: Client[];
}

export default function ClientTable({ clients }: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="text-sm font-medium text-ink">
          No se encontraron clientes
        </p>
        <p className="mt-1 text-sm text-muted">
          Prueba con otro nombre, cédula o teléfono.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {clients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Cédula</th>
              <th className="px-5 py-3 font-medium">Teléfono</th>
              <th className="px-5 py-3 font-medium">Fuente</th>
              <th className="px-5 py-3 font-medium">Fecha de registro</th>
              <th className="px-5 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-background/60">
                <td className="px-5 py-3 font-medium text-ink">
                  {client.fullName}
                </td>
                <td className="px-5 py-3 text-muted">{client.cedula}</td>
                <td className="px-5 py-3 text-muted">{client.phone}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                    {formatClientSource(client.source)}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">
                  {formatDate(client.createdAt)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/clientes/${client.id}`}
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
