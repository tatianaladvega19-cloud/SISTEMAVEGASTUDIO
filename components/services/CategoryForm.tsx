"use client";

import Link from "next/link";
import { useActionState } from "react";
import FormField, { fieldControlClass } from "./FormField";
import { createServiceCategoryAction } from "@/app/(dashboard)/servicios/categorias/nueva/actions";
import { initialCreateServiceCategoryState } from "@/app/(dashboard)/servicios/categorias/nueva/form-state";
import type { CreateServiceCategoryFormState } from "@/app/(dashboard)/servicios/categorias/nueva/form-state";
import type { ServiceCategory } from "@/lib/types";

interface CategoryFormProps {
  /** Presente en modo edición: ajusta el texto del botón. */
  category?: ServiceCategory;
  /** Server Action a invocar. Por defecto, crear categoría nueva. */
  action?: (
    prevState: CreateServiceCategoryFormState,
    formData: FormData
  ) => Promise<CreateServiceCategoryFormState>;
  /** Estado inicial del formulario. Por defecto, campos vacíos (alta). */
  initialState?: CreateServiceCategoryFormState;
}

export default function CategoryForm({
  category,
  action = createServiceCategoryAction,
  initialState = initialCreateServiceCategoryState,
}: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submitLabel = category ? "Guardar cambios" : "Guardar categoría";

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink">Datos de la categoría</h3>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <FormField
            label="Nombre de la categoría"
            htmlFor="name"
            required
            error={state.errors.name}
          >
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={state.values.name}
              placeholder="Ej. Pestañas"
              className={fieldControlClass(!!state.errors.name)}
            />
          </FormField>

          <FormField label="Descripción" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={state.values.description}
              placeholder="Detalle breve de la categoría"
              className={fieldControlClass()}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/servicios"
          className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-background"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
