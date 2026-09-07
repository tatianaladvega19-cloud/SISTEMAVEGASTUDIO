// Verificación y cambio de contraseña simulados.
//
// No hay hashing ni backend real: esto solo compara/actualiza contra
// lib/mocks/credentials.ts, respaldado en localStorage para que un
// cambio de contraseña sobreviva a un recargo de página (igual que la
// sesión simulada en lib/auth/session.ts). El día que exista
// autenticación real, este módulo es el punto a reemplazar por
// llamadas a la API; components/profile/PasswordForm.tsx no debería
// necesitar cambios.

import { mockCredentials, DEFAULT_MOCK_PASSWORD } from "@/lib/mocks/credentials";

const CREDENTIALS_STORAGE_KEY = "vega-studio:mock-credentials";

function readStoredCredentials(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredCredentials(credentials: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CREDENTIALS_STORAGE_KEY,
      JSON.stringify(credentials)
    );
  } catch {
    // Almacenamiento no disponible: el cambio de contraseña simplemente
    // no persiste entre recargas.
  }
}

export function verifyPassword(userId: string, password: string): boolean {
  const stored = readStoredCredentials();
  const currentPassword =
    stored[userId] ?? mockCredentials[userId] ?? DEFAULT_MOCK_PASSWORD;
  return currentPassword === password;
}

export function updatePassword(userId: string, newPassword: string): void {
  const stored = readStoredCredentials();
  stored[userId] = newPassword;
  writeStoredCredentials(stored);
}
