import Link from "next/link";
import ProfessionalCard from "./ProfessionalCard";
import ProfessionalStatusBadge from "./ProfessionalStatusBadge";
import { toggleProfessionalActiveAction } from "@/app/(dashboard)/profesionales/actions";
import type { Professional } from "@/lib/types";

interface ProfessionalsTableProps {
  professionals: Professional[];
}

export default function ProfessionalsTable({
  professionals,
}: ProfessionalsTableProps) {
  if (professionals.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="text-sm font-medium text-ink">
          No hay profesionales registradas
        </p>
        <p className="mt-1 text-sm text-muted">
          Crea la primera profesional del equipo de VEGA STUDIO.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {professionals.map((professional) => (
          <ProfessionalCard key={professional.id} professional={professional} />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Profesional</th>
              <th className="px-5 py-3 font-medium">Especialidad</th>
              <th className="px-5 py-3 font-medium">Teléfono</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {professionals.map((professional) => (
              <tr key={professional.id} className="hover:bg-background/60">
                <td className="px-5 py-3 font-medium text-ink">
                  {professional.name}
                </td>
                <td className="px-5 py-3 text-muted">
                  {professional.specialty ?? "—"}
                </td>
                <td className="px-5 py-3 text-muted">
                  {professional.phone ?? "—"}
                </td>
                <td className="px-5 py-3 text-muted">
                  {professional.email ?? "—"}
                </td>
                <td className="px-5 py-3">
                  <ProfessionalStatusBadge isActive={professional.isActive} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/profesionales/${professional.id}/editar`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Editar
                    </Link>
                    <form
                      action={toggleProfessionalActiveAction.bind(
                        null,
                        professional.id,
                        !professional.isActive
                      )}
                    >
                      <button
                        type="submit"
                        className="text-sm font-medium text-muted hover:text-ink hover:underline"
                      >
                        {professional.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
