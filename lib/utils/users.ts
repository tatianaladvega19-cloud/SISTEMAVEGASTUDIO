// Cálculos, búsquedas y filtros derivados para el módulo de Usuarios.
// Mismo patrón que lib/utils/clients.ts y lib/utils/services.ts:
// reciben los datos como parámetros para que sigan funcionando igual
// el día que vengan de una API real.

import type { Role, User } from "../types";

// ---------------------------------------------------------------------------
// Métricas del resumen superior
// ---------------------------------------------------------------------------

export interface UserMetrics {
  totalCount: number;
  activeCount: number;
  adminsCount: number;
  vendedoresCount: number;
}

export function getUserMetrics(users: User[]): UserMetrics {
  return {
    totalCount: users.length,
    activeCount: users.filter((user) => user.isActive).length,
    adminsCount: users.filter((user) => user.role === "ADMIN").length,
    vendedoresCount: users.filter((user) => user.role === "VENDEDOR").length,
  };
}

// ---------------------------------------------------------------------------
// Filtros del listado de usuarios
// ---------------------------------------------------------------------------

export type UserRoleFilter = "all" | Role;
export type UserStatusFilter = "all" | "active" | "inactive";

export interface UserFiltersState {
  search: string;
  role: UserRoleFilter;
  status: UserStatusFilter;
}

export const defaultUserFilters: UserFiltersState = {
  search: "",
  role: "all",
  status: "all",
};

export function filterUsers(users: User[], filters: UserFiltersState): User[] {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    if (
      normalizedSearch &&
      !user.name.toLowerCase().includes(normalizedSearch) &&
      !user.email.toLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }
    if (filters.role !== "all" && user.role !== filters.role) return false;
    if (filters.status === "active" && !user.isActive) return false;
    if (filters.status === "inactive" && user.isActive) return false;

    return true;
  });
}

// ---------------------------------------------------------------------------
// Búsquedas puntuales
// ---------------------------------------------------------------------------

export function findUserById(users: User[], id: string): User | undefined {
  return users.find((user) => user.id === id);
}

// Verifica que un email o username no esté ya en uso por otro usuario.
// excludeId permite excluir al propio usuario cuando se está editando.
export function isEmailTaken(
  users: User[],
  email: string,
  excludeId?: string
): boolean {
  const normalized = email.trim().toLowerCase();
  return users.some(
    (user) => user.id !== excludeId && user.email.toLowerCase() === normalized
  );
}

export function isUsernameTaken(
  users: User[],
  username: string,
  excludeId?: string
): boolean {
  const normalized = username.trim().toLowerCase();
  return users.some(
    (user) => user.id !== excludeId && user.username.toLowerCase() === normalized
  );
}
