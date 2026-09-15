import Link from "next/link";
import { toggleServiceCategoryActiveAction } from "@/app/(dashboard)/servicios/categorias/actions";
import type { CategoryWithServiceCount } from "@/lib/utils/services";

interface CategoryOverviewProps {
  categories: CategoryWithServiceCount[];
}

export default function CategoryOverview({ categories }: CategoryOverviewProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="text-sm font-medium text-ink">
          Todavía no hay categorías
        </p>
        <p className="mt-1 text-sm text-muted">
          Crea la primera categoría para poder asignarla a tus servicios.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="rounded-xl border border-line bg-surface p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-ink">{category.name}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                category.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {category.isActive ? "Activa" : "Inactiva"}
            </span>
          </div>

          {category.description && (
            <p className="mt-1.5 text-xs text-muted">{category.description}</p>
          )}

          <p className="mt-3 text-xs text-muted">
            <span className="font-medium text-ink">{category.servicesCount}</span>{" "}
            servicio{category.servicesCount === 1 ? "" : "s"} asociado
            {category.servicesCount === 1 ? "" : "s"}
          </p>

          <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
            <Link
              href={`/servicios/categorias/${category.id}/editar`}
              className="text-xs font-medium text-accent hover:underline"
            >
              Editar
            </Link>
            <form
              action={toggleServiceCategoryActiveAction.bind(
                null,
                category.id,
                !category.isActive
              )}
            >
              <button
                type="submit"
                className="text-xs font-medium text-muted hover:text-ink hover:underline"
              >
                {category.isActive ? "Desactivar" : "Activar"}
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
