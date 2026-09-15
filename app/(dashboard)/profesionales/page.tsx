import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import ProfessionalsTable from "@/components/professionals/ProfessionalsTable";
import { getAllProfessionals } from "@/lib/data/professionals-store";

// Los profesionales viven en Supabase y pueden cambiar entre sesiones,
// así que esta página no puede quedar cacheada de forma estática (mismo
// criterio que app/(dashboard)/servicios/page.tsx).
export const dynamic = "force-dynamic";

export default async function ProfesionalesPage() {
  const professionals = await getAllProfessionals();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Profesionales"
          description="Administra el equipo de VEGA STUDIO y los servicios que puede realizar cada profesional."
        />
        <Link
          href="/profesionales/nuevo"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo profesional
        </Link>
      </div>

      <div className="mt-6">
        <ProfessionalsTable professionals={professionals} />
      </div>
    </div>
  );
}
