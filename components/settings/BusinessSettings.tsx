"use client";

// Tarjeta "Información del negocio" de /configuracion. Vive enteramente
// en estado local: mientras no exista backend, "Guardar cambios" solo
// valida y muestra una confirmación temporal en pantalla. El día que
// exista Supabase, este estado inicial pasa a poblarse desde una fila
// de configuración del negocio y handleSubmit hace el upsert real.

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import FormField, { fieldControlClass } from "@/components/clients/FormField";
import DashboardCard from "@/components/dashboard/DashboardCard";

interface BusinessInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const INITIAL_VALUES: BusinessInfo = {
  name: "VEGA STUDIO",
  phone: "+1 (809) 555-0192",
  email: "contacto@vegastudio.com",
  address: "Av. Winston Churchill 1099",
  city: "Santo Domingo",
};

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const CONFIRMATION_TIMEOUT_MS = 3000;

export default function BusinessSettings() {
  const [values, setValues] = useState<BusinessInfo>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), CONFIRMATION_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [saved]);

  const handleChange =
    (field: keyof BusinessInfo) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setSaved(false);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = "El nombre del negocio es obligatorio.";
    }
    if (!values.phone.trim()) {
      nextErrors.phone = "El teléfono es obligatorio.";
    }
    if (!values.email.trim()) {
      nextErrors.email = "El correo electrónico es obligatorio.";
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSaved(false);
      return;
    }

    // TODO(Supabase): persistir en la tabla de configuración del negocio.
    setSaved(true);
  };

  return (
    <DashboardCard title="Información del negocio">
      <p className="-mt-2 mb-4 text-sm text-muted">
        Configura los datos principales que identifican a tu negocio.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre del negocio"
            htmlFor="business-name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              id="business-name"
              type="text"
              value={values.name}
              onChange={handleChange("name")}
              className={fieldControlClass(!!errors.name)}
            />
          </FormField>

          <FormField
            label="Teléfono"
            htmlFor="business-phone"
            required
            error={errors.phone}
          >
            <input
              id="business-phone"
              type="tel"
              value={values.phone}
              onChange={handleChange("phone")}
              className={fieldControlClass(!!errors.phone)}
            />
          </FormField>

          <FormField
            label="Correo electrónico"
            htmlFor="business-email"
            required
            error={errors.email}
          >
            <input
              id="business-email"
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              className={fieldControlClass(!!errors.email)}
            />
          </FormField>

          <FormField
            label="Dirección"
            htmlFor="business-address"
            className="sm:col-span-2"
          >
            <input
              id="business-address"
              type="text"
              value={values.address}
              onChange={handleChange("address")}
              className={fieldControlClass()}
            />
          </FormField>

          <FormField label="Ciudad" htmlFor="business-city">
            <input
              id="business-city"
              type="text"
              value={values.city}
              onChange={handleChange("city")}
              className={fieldControlClass()}
            />
          </FormField>
        </div>

        {saved && (
          <p className="text-sm text-green-600">
            Cambios guardados correctamente.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </DashboardCard>
  );
}
