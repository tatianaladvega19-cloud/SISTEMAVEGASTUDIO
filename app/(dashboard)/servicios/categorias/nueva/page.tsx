import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import CategoryForm from "@/components/services/CategoryForm";

export default function NuevaCategoriaPage() {
  return (
    <div>
      <Link
        href="/servicios"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        ← Volver a servicios
      </Link>

      <PageHeader
        title="Nueva categoría"
        description="Registra una nueva categoría del catálogo de VEGA STUDIO."
      />

      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
