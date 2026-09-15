import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CategoryForm from "@/components/services/CategoryForm";
import { getServiceCategoryById } from "@/lib/data/services-store";
import { updateServiceCategoryAction } from "./actions";
import { getInitialEditServiceCategoryFormState } from "./form-state";

// La categoría puede haber cambiado desde otra sesión (Supabase), así
// que esta página no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

interface EditarCategoriaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarCategoriaPage({
  params,
}: EditarCategoriaPageProps) {
  const { id } = await params;

  const category = await getServiceCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/servicios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a servicios
      </Link>

      <PageHeader
        title={`Editar ${category.name}`}
        description="Actualiza el nombre y la descripción de la categoría."
      />

      <div className="mt-6">
        <CategoryForm
          category={category}
          action={updateServiceCategoryAction.bind(null, category.id)}
          initialState={getInitialEditServiceCategoryFormState(category)}
        />
      </div>
    </div>
  );
}
