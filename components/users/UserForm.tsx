"use client";

// Formulario modal de creación/edición de usuarios. Mientras no exista
// backend, vive enteramente en memoria: UsersExplorer decide qué hacer
// con los valores que devuelve (crear un User nuevo o mezclarlos sobre
// uno existente). La contraseña nunca se lee desde `user` ni se
// persiste de verdad: solo se valida en pantalla, igual que hace
// PasswordForm en /perfil.

import { useState, type FormEvent } from "react";
import FormField, { fieldControlClass } from "@/components/clients/FormField";
import { getRoleLabel } from "@/lib/auth/session";
import { isEmailTaken, isUsernameTaken } from "@/lib/utils/users";
import type { Role, User } from "@/lib/types";

export interface UserFormSubmitValues {
  name: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  /** Solo presente si se definió/cambió una contraseña. */
  password?: string;
}

interface UserFormProps {
  mode: "create" | "edit";
  user?: User;
  users: User[];
  onClose: () => void;
  onSave: (values: UserFormSubmitValues) => void;
}

interface FormValues {
  name: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 6;
const ROLE_OPTIONS: Role[] = ["ADMIN", "VENDEDOR"];

function buildInitialValues(user?: User): FormValues {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    username: user?.username ?? "",
    role: user?.role ?? "VENDEDOR",
    isActive: user?.isActive ?? true,
    password: "",
    confirmPassword: "",
  };
}

export default function UserForm({
  mode,
  user,
  users,
  onClose,
  onSave,
}: UserFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(user));
  const [errors, setErrors] = useState<FormErrors>({});

  const isEdit = mode === "edit";

  const handleChange = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const username = values.username.trim();

    if (!name) {
      nextErrors.name = "El nombre completo es obligatorio.";
    }

    if (!username) {
      nextErrors.username = "El nombre de usuario es obligatorio.";
    } else if (isUsernameTaken(users, username, user?.id)) {
      nextErrors.username = "Ese nombre de usuario ya está en uso.";
    }

    if (!email) {
      nextErrors.email = "El email es obligatorio.";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Ingresa un email válido.";
    } else if (isEmailTaken(users, email, user?.id)) {
      nextErrors.email = "Ese email ya está en uso.";
    }

    // En creación la contraseña es obligatoria; en edición solo se
    // valida si el admin decidió escribir una nueva.
    const wantsPasswordChange =
      !isEdit || values.password.length > 0 || values.confirmPassword.length > 0;

    if (wantsPasswordChange) {
      if (!values.password) {
        nextErrors.password = "La contraseña es obligatoria.";
      } else if (values.password.length < MIN_PASSWORD_LENGTH) {
        nextErrors.password = `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
      }

      if (!values.confirmPassword) {
        nextErrors.confirmPassword = "Confirma la contraseña.";
      } else if (values.confirmPassword !== values.password) {
        nextErrors.confirmPassword = "Las contraseñas no coinciden.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      name,
      email,
      username,
      role: values.role,
      isActive: values.isActive,
      password: wantsPasswordChange ? values.password : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-line bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {isEdit ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {isEdit
                ? "Actualiza los datos y el rol de este usuario."
                : "Crea una cuenta para el equipo de VEGA STUDIO."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre completo"
              htmlFor="user-name"
              required
              error={errors.name}
              className="sm:col-span-2"
            >
              <input
                id="user-name"
                type="text"
                value={values.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Ej. María Fernanda López"
                className={fieldControlClass(!!errors.name)}
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="user-email"
              required
              error={errors.email}
            >
              <input
                id="user-email"
                type="email"
                value={values.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="Ej. usuario@vegastudio.com"
                className={fieldControlClass(!!errors.email)}
              />
            </FormField>

            <FormField
              label="Nombre de usuario"
              htmlFor="user-username"
              required
              error={errors.username}
            >
              <input
                id="user-username"
                type="text"
                value={values.username}
                onChange={(event) => handleChange("username", event.target.value)}
                placeholder="Ej. maria.lopez"
                className={fieldControlClass(!!errors.username)}
              />
            </FormField>

            <FormField label="Rol" htmlFor="user-role" required>
              <select
                id="user-role"
                value={values.role}
                onChange={(event) =>
                  handleChange("role", event.target.value as Role)
                }
                className={fieldControlClass()}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {getRoleLabel(role)}
                  </option>
                ))}
              </select>
            </FormField>

            {isEdit && (
              <FormField label="Estado" htmlFor="user-status">
                <div className="inline-flex rounded-lg border border-line bg-background p-1">
                  <button
                    type="button"
                    onClick={() => handleChange("isActive", true)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      values.isActive
                        ? "bg-ink text-white"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Activo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("isActive", false)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      !values.isActive
                        ? "bg-ink text-white"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Inactivo
                  </button>
                </div>
              </FormField>
            )}
          </div>

          <div className="rounded-xl border border-line bg-background/60 p-4">
            <h3 className="text-sm font-semibold text-ink">
              {isEdit ? "Actualizar contraseña" : "Contraseña"}
            </h3>
            {isEdit && (
              <p className="mt-1 text-xs text-muted">
                Déjalo en blanco para mantener la contraseña actual.
              </p>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label={isEdit ? "Nueva contraseña" : "Contraseña"}
                htmlFor="user-password"
                required={!isEdit}
                error={errors.password}
              >
                <input
                  id="user-password"
                  type="password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  className={fieldControlClass(!!errors.password)}
                />
              </FormField>

              <FormField
                label={isEdit ? "Confirmar nueva contraseña" : "Confirmar contraseña"}
                htmlFor="user-confirm-password"
                required={!isEdit}
                error={errors.confirmPassword}
              >
                <input
                  id="user-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(event) =>
                    handleChange("confirmPassword", event.target.value)
                  }
                  className={fieldControlClass(!!errors.confirmPassword)}
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-background"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {isEdit ? "Guardar cambios" : "Guardar usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
