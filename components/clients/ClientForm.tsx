"use client";

import Link from "next/link";
import { useActionState } from "react";
import FormField, { fieldControlClass } from "./FormField";
import { createClientAction } from "@/app/(dashboard)/clientes/nuevo/actions";
import { initialCreateClientState } from "@/app/(dashboard)/clientes/nuevo/form-state";
import type { CreateClientFormState } from "@/app/(dashboard)/clientes/nuevo/form-state";
import { CLIENT_SOURCE_OPTIONS } from "@/lib/utils/format";
import type { Client } from "@/lib/types";

interface ClientFormProps {
  /** Presente en modo edición: ajusta el texto del botón y el enlace de cancelar. */
  client?: Client;
  /** Server Action a invocar. Por defecto, crear cliente nuevo. */
  action?: (
    prevState: CreateClientFormState,
    formData: FormData
  ) => Promise<CreateClientFormState>;
  /** Estado inicial del formulario. Por defecto, campos vacíos (alta). */
  initialState?: CreateClientFormState;
}

export default function ClientForm({
  client,
  action = createClientAction,
  initialState = initialCreateClientState,
}: ClientFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const submitLabel = client ? "Guardar cambios" : "Guardar cliente";
  const cancelHref = client ? `/clientes/${client.id}` : "/clientes";

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink">Datos del cliente</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre completo"
            htmlFor="fullName"
            required
            error={state.errors.fullName}
            className="sm:col-span-2"
          >
            <input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={state.values.fullName}
              placeholder="Ej. María Fernanda López"
              className={fieldControlClass(!!state.errors.fullName)}
            />
          </FormField>

          <FormField
            label="Cédula"
            htmlFor="cedula"
            required
            error={state.errors.cedula}
          >
            <input
              id="cedula"
              name="cedula"
              type="text"
              defaultValue={state.values.cedula}
              placeholder="Ej. 1102345678"
              className={fieldControlClass(!!state.errors.cedula)}
            />
          </FormField>

          <FormField
            label="Teléfono"
            htmlFor="phone"
            required
            error={state.errors.phone}
          >
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={state.values.phone}
              placeholder="Ej. 0987654321"
              className={fieldControlClass(!!state.errors.phone)}
            />
          </FormField>

          <FormField label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={state.values.email}
              placeholder="Ej. cliente@correo.com"
              className={fieldControlClass()}
            />
          </FormField>

          <FormField label="Dirección" htmlFor="address">
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={state.values.address}
              placeholder="Ej. Av. Amazonas N34-120, Quito"
              className={fieldControlClass()}
            />
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-semibold text-ink">
          Fuente de adquisición
        </h3>
        <p className="mt-1 text-sm text-muted">
          ¿Cómo llegó este cliente a VEGA STUDIO?
        </p>

        <div className="mt-4 sm:w-1/2">
          <FormField label="Fuente" htmlFor="source">
            <select
              id="source"
              name="source"
              defaultValue={state.values.source}
              className={fieldControlClass()}
            >
              {CLIENT_SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href={cancelHref}
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
