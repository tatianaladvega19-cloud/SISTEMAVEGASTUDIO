import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import ServiceForm from "@/components/services/ServiceForm";
import { getAllServiceCategories } from "@/lib/data/services-store";
import { getSelectableCategoriesForService } from "@/lib/utils/services";

// Las categorías pueden cambiar entre sesiones (Supabase), así que esta
// página no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

export default async function NuevoServicioPage() {
  const allCategories = await getAllServiceCategories();
  // Un servicio nuevo solo puede asignarse a una categoría activa.
  const categories = getSelectableCategoriesForService(allCategories);

  return (
    <div>
      <Link
        href="/servicios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a servicios
      </Link>

      <PageHeader
        title="Nuevo servicio"
        description="Registra un nuevo servicio del catálogo de VEGA STUDIO."
      />

      <ServiceForm categories={categories} />
    </div>
  );
}
