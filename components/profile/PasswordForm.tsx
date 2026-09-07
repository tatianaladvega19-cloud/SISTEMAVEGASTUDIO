"use client";

// Cambio de contraseña simulado de /perfil. Verifica y actualiza
// contra lib/auth/credentials.ts, separado por completo del modelo
// User: la contraseña nunca pasa por useSession() ni por el estado de
// perfil.

import { useState, type ChangeEvent, type FormEvent } from "react";
import FormField, { fieldControlClass } from "@/components/clients/FormField";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useSession } from "@/lib/auth/session-context";
import { updatePassword, verifyPassword } from "@/lib/auth/credentials";

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const EMPTY_VALUES: FormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function PasswordForm() {
  const { user } = useSession();
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleChange =
    (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setSuccess(false);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!values.currentPassword) {
      nextErrors.currentPassword = "Ingresa tu contraseña actual.";
    } else if (!verifyPassword(user.id, values.currentPassword)) {
      nextErrors.currentPassword = "La contraseña actual no es correcta.";
    }

    if (!values.newPassword) {
      nextErrors.newPassword = "Ingresa una nueva contraseña.";
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Confirma la nueva contraseña.";
    } else if (
      values.newPassword &&
      values.confirmPassword !== values.newPassword
    ) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSuccess(false);
      return;
    }

    updatePassword(user.id, values.newPassword);
    setValues(EMPTY_VALUES);
    setSuccess(true);
  };

  return (
    <DashboardCard title="Cambiar contraseña">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Contraseña actual"
          htmlFor="currentPassword"
          required
          error={errors.currentPassword}
        >
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={handleChange("currentPassword")}
            className={fieldControlClass(!!errors.currentPassword)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Nueva contraseña"
            htmlFor="newPassword"
            required
            error={errors.newPassword}
          >
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={values.newPassword}
              onChange={handleChange("newPassword")}
              className={fieldControlClass(!!errors.newPassword)}
            />
          </FormField>

          <FormField
            label="Confirmar nueva contraseña"
            htmlFor="confirmPassword"
            required
            error={errors.confirmPassword}
          >
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              className={fieldControlClass(!!errors.confirmPassword)}
            />
          </FormField>
        </div>

        {success && (
          <p className="text-sm text-green-600">
            Contraseña actualizada correctamente.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Actualizar contraseña
          </button>
        </div>
      </form>
    </DashboardCard>
  );
}
