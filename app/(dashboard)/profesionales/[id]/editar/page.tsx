import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProfessionalForm from "@/components/professionals/ProfessionalForm";
import {
  getProfessionalById,
  getServiceIdsForProfessional,
} from "@/lib/data/professionals-store";
import { getAllServices } from "@/lib/data/services-store";
import { updateProfessionalAction } from "./actions";
import { getInitialEditProfessionalFormState } from "./form-state";

// El profesional puede haber cambiado desde otra sesión (Supabase), así
// que esta página no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

interface EditarProfesionalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProfesionalPage({
  params,
}: EditarProfesionalPageProps) {
  const { id } = await params;

  const [professional, allServices, assignedServiceIds] = await Promise.all([
    getProfessionalById(id),
    getAllServices(),
    getServiceIdsForProfessional(id),
  ]);

  if (!professional) {
    notFound();
  }

  // El selector debe seguir mostrando los servicios ya asignados aunque
  // hayan sido desactivados después, para no perder esa relación (mismo
  // criterio que getSelectableCategoriesForService en Servicios).
  const services = allServices.filter(
    (service) => service.isActive || assignedServiceIds.includes(service.id)
  );

  return (
    <div>
      <Link
        href="/profesionales"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a profesionales
      </Link>

      <PageHeader
        title={`Editar ${professional.name}`}
        description="Actualiza los datos y los servicios que puede realizar."
      />

      <div className="mt-6">
        <ProfessionalForm
          professional={professional}
          services={services}
          action={updateProfessionalAction.bind(null, professional.id)}
          initialState={getInitialEditProfessionalFormState(
            professional,
            assignedServiceIds
          )}
        />
      </div>
    </div>
  );
}
