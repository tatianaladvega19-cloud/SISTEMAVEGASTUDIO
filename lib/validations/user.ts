// Validación del formulario de Usuario (alta/edición desde /usuarios).
// Función pura, mismo patrón que lib/validations/client.ts y
// lib/validations/professional.ts: no conoce Supabase ni ningún
// origen de datos, así que la unicidad de username/email se le pasa
// como dependencia (isUsernameTaken/isEmailTaken), ya sea la versión
// en memoria de lib/utils/users.ts (validación optimista en el
// modal) o la que consulta profiles vía admin client dentro del
// Server Action (validación real, ver lib/data/users-store.ts).

import type { Role } from "@/lib/types";

export interface UserFormValues {
  name: string;
  username: string;
  email: string;
  role: Role;
}

export interface UserFormErrors {
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_VALUES: Role[] = ["ADMIN", "VENDEDOR"];
export const MIN_PASSWORD_LENGTH = 6;

export function validateUserFields(
  values: UserFormValues,
  isUsernameTaken: (username: string) => boolean,
  isEmailTaken: (email: string) => boolean
): UserFormErrors {
  const errors: UserFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "El nombre completo es obligatorio.";
  }

  if (!values.username.trim()) {
    errors.username = "El nombre de usuario es obligatorio.";
  } else if (isUsernameTaken(values.username.trim())) {
    errors.username = "Ese nombre de usuario ya está en uso.";
  }

  if (!values.email.trim()) {
    errors.email = "El email es obligatorio.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Ingresa un email válido.";
  } else if (isEmailTaken(values.email.trim())) {
    errors.email = "Ese email ya está en uso.";
  }

  if (!ROLE_VALUES.includes(values.role)) {
    errors.role = "Selecciona un rol válido.";
  }

  return errors;
}

/**
 * Valida una contraseña nueva/inicial. Se llama aparte de
 * validateUserFields porque no siempre se está cambiando la
 * contraseña (edición sin tocarla): quien invoca decide cuándo
 * corresponde validar esto.
 */
export function validatePasswordFields(
  password: string,
  confirmPassword: string
): Pick<UserFormErrors, "password" | "confirmPassword"> {
  const errors: Pick<UserFormErrors, "password" | "confirmPassword"> = {};

  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirma la contraseña.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
}
