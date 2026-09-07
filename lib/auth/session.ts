// Sesión simulada de VEGA STUDIO.
//
// No hay autenticación real todavía: esto solo recuerda qué usuario de
// `lib/mocks/users.ts` fue "seleccionado" en /login, para poder probar
// el flujo completo (login -> dashboard según rol -> logout).
//
// El día que se conecte autenticación real, este módulo es el punto a
// reemplazar: la forma de consumirlo (SessionProvider/useSession) puede
// mantenerse igual mientras cambia lo que hay detrás.

import { mockUsers } from "@/lib/mocks/users";
import { applyProfileOverride } from "./profile";
import type { Role, User } from "@/lib/types";

export const SESSION_STORAGE_KEY = "vega-studio:session-user-id";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
};

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  const user = mockUsers
    .map(applyProfileOverride)
    .find((user) => user.email.toLowerCase() === normalized);
  return user;
}

export function findUserById(id: string): User | undefined {
  const user = mockUsers.find((user) => user.id === id);
  return user ? applyProfileOverride(user) : undefined;
}

export function readStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, userId);
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Almacenamiento no disponible (modo privado, etc.): la sesión
    // simulada simplemente no persiste entre recargas.
  }
}
