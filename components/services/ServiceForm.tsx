"use client";

import Link from "next/link";
import { useActionState } from "react";
import FormField, { fieldControlClass } from "./FormField";
import { createServiceAction } from "@/app/(dashboard)/servicios/nuevo/actions";
import { initialCreateServiceState } from "@/app/(dashboard)/servicios/nuevo/form-state";
import type { CreateServiceFormState } from "@/app/(dashboard)/servicios/nuevo/form-state";
import type { Service, ServiceCategory } from "@/lib/types";

interface ServiceFormProps {
  /** Presente en modo edición: ajusta el texto del botón. */
  service?: Service;
  categories: ServiceCategory[];
  /** Server Action a invocar. Por defecto, crear servicio nuevo. */
  action?: (
    prevState: CreateServiceFormState,
    formData: FormData
  ) => Promise<CreateServiceFormState>;
  /** Estado inicial del formulario. Por defecto, campos vacíos (alta). */
  initialState?: CreateServiceFormState;
}

export default function ServiceForm({
  service,
  categories,
  action = createServiceAction,
  initialState = initialCreateServiceState,
}: ServiceFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submitLabel = service ? "Guardar cambios" : "Guardar servicio";

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink">Datos del servicio</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre del servicio"
            htmlFor="name"
            required
            error={state.errors.name}
            className="sm:col-span-2"
          >
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={state.values.name}
              placeholder="Ej. Lifting de pestañas"
              className={fieldControlClass(!!state.errors.name)}
            />
          </FormField>

          <FormField
            label="Categoría"
            htmlFor="categoryId"
            required
            error={state.errors.categoryId}
          >
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={state.values.categoryId}
              className={fieldControlClass(!!state.errors.categoryId)}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Precio"
            htmlFor="price"
            required
            error={state.errors.price}
          >
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={state.values.price}
              placeholder="Ej. 25"
              className={fieldControlClass(!!state.errors.price)}
            />
          </FormField>

          <FormField
            label="Descripción"
            htmlFor="description"
            className="sm:col-span-2"
          >
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={state.values.description}
              placeholder="Detalle breve del servicio"
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
