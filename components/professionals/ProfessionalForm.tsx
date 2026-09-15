"use client";

import Link from "next/link";
import { useActionState } from "react";
import FormField, { fieldControlClass } from "./FormField";
import { createProfessionalAction } from "@/app/(dashboard)/profesionales/nuevo/actions";
import { initialCreateProfessionalState } from "@/app/(dashboard)/profesionales/nuevo/form-state";
import type { CreateProfessionalFormState } from "@/app/(dashboard)/profesionales/nuevo/form-state";
import type { Professional, Service } from "@/lib/types";

interface ProfessionalFormProps {
  /** Presente en modo edición: ajusta el texto del botón. */
  professional?: Professional;
  /** Servicios ofrecidos en el selector de checkboxes (activos, más el
   * actualmente asignado si ya fue desactivado; ver page.tsx de editar). */
  services: Service[];
  /** Server Action a invocar. Por defecto, crear profesional nuevo. */
  action?: (
    prevState: CreateProfessionalFormState,
    formData: FormData
  ) => Promise<CreateProfessionalFormState>;
  /** Estado inicial del formulario. Por defecto, campos vacíos (alta). */
  initialState?: CreateProfessionalFormState;
}

export default function ProfessionalForm({
  professional,
  services,
  action = createProfessionalAction,
  initialState = initialCreateProfessionalState,
}: ProfessionalFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submitLabel = professional ? "Guardar cambios" : "Guardar profesional";
  const selectedServiceIds = new Set(state.values.serviceIds);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink">Datos del profesional</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre"
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
              placeholder="Ej. Camila"
              className={fieldControlClass(!!state.errors.name)}
            />
          </FormField>

          <FormField label="Especialidad" htmlFor="specialty">
            <input
              id="specialty"
              name="specialty"
              type="text"
              defaultValue={state.values.specialty}
              placeholder="Ej. Micropigmentación"
              className={fieldControlClass()}
            />
          </FormField>

          <FormField label="Teléfono" htmlFor="phone" error={state.errors.phone}>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={state.values.phone}
              placeholder="Ej. +593 99 123 4567"
              className={fieldControlClass(!!state.errors.phone)}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            error={state.errors.email}
            className="sm:col-span-2"
          >
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={state.values.email}
              placeholder="Ej. camila@vegastudio.com"
              className={fieldControlClass(!!state.errors.email)}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink">
          Servicios que puede realizar
        </h3>
        <p className="mt-1 text-xs text-muted">
          Selecciona los servicios que esta profesional puede realizar.
        </p>

        {services.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No hay servicios activos disponibles todavía.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center gap-2.5 rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink hover:bg-background"
              >
                <input
                  type="checkbox"
                  name="serviceIds"
                  value={service.id}
                  defaultChecked={selectedServiceIds.has(service.id)}
                  className="h-4 w-4 rounded border-line text-accent focus:ring-accent/20"
                />
                {service.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/profesionales"
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
