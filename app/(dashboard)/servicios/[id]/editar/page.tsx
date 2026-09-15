import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ServiceForm from "@/components/services/ServiceForm";
import { getServiceById, getAllServiceCategories } from "@/lib/data/services-store";
import { getSelectableCategoriesForService } from "@/lib/utils/services";
import { updateServiceAction } from "./actions";
import { getInitialEditServiceFormState } from "./form-state";

// El servicio puede haber cambiado desde otra sesión (Supabase), así
// que esta página no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

interface EditarServicioPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarServicioPage({
  params,
}: EditarServicioPageProps) {
  const { id } = await params;

  const [service, allCategories] = await Promise.all([
    getServiceById(id),
    getAllServiceCategories(),
  ]);

  if (!service) {
    notFound();
  }

  // El select debe seguir mostrando la categoría actual del servicio
  // aunque haya sido desactivada después, para no perder category_id.
  const categories = getSelectableCategoriesForService(
    allCategories,
    service.categoryId
  );

  return (
    <div>
      <Link
        href="/servicios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a servicios
      </Link>

      <PageHeader
        title={`Editar ${service.name}`}
        description="Actualiza los datos y el precio del servicio."
      />

      <div className="mt-6">
        <ServiceForm
          service={service}
          categories={categories}
          action={updateServiceAction.bind(null, service.id)}
          initialState={getInitialEditServiceFormState(service)}
        />
      </div>
    </div>
  );
}
