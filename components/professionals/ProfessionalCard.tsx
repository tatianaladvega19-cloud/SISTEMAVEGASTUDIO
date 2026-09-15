import Link from "next/link";
import ProfessionalStatusBadge from "./ProfessionalStatusBadge";
import { toggleProfessionalActiveAction } from "@/app/(dashboard)/profesionales/actions";
import type { Professional } from "@/lib/types";

interface ProfessionalCardProps {
  professional: Professional;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {professional.name}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {professional.specialty || "Sin especialidad"}
          </p>
        </div>
        <ProfessionalStatusBadge isActive={professional.isActive} />
      </div>

      {(professional.phone || professional.email) && (
        <div className="mt-2 space-y-0.5 text-xs text-muted">
          {professional.phone && <p>{professional.phone}</p>}
          {professional.email && <p>{professional.email}</p>}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-3">
        <Link
          href={`/profesionales/${professional.id}/editar`}
          className="text-xs font-medium text-accent hover:underline"
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
            className="text-xs font-medium text-muted hover:text-ink hover:underline"
          >
            {professional.isActive ? "Desactivar" : "Activar"}
          </button>
        </form>
      </div>
    </div>
  );
}
