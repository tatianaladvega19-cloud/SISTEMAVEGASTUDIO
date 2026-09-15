import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import ProfessionalForm from "@/components/professionals/ProfessionalForm";
import { getAllServices } from "@/lib/data/services-store";

// Los servicios pueden cambiar entre sesiones (Supabase), así que esta
// página no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

export default async function NuevoProfesionalPage() {
  const allServices = await getAllServices();
  // El selector de un profesional nuevo solo debe ofrecer servicios activos.
  const services = allServices.filter((service) => service.isActive);

  return (
    <div>
      <Link
        href="/profesionales"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a profesionales
      </Link>

      <PageHeader
        title="Nuevo profesional"
        description="Registra una nueva profesional del equipo de VEGA STUDIO."
      />

      <ProfessionalForm services={services} />
    </div>
  );
}
