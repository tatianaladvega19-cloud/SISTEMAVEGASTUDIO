// Reglas de negocio puras del módulo Usuarios: mapeo de filas
// (profiles + auth.users -> User) y protección del último
// administrador (PASO 6 del pedido). Se separan de
// lib/data/users-store.ts (que sí importa "server-only" y llama a
// Supabase) para poder probarlas con node --test sin depender de
// Supabase ni de next/headers: "server-only" lanza un error si se
// importa fuera de un entorno de React Server Components (ver
// node_modules/server-only/package.json → export condition
// "react-server"), lo que rompería estas pruebas si vivieran en el
// mismo archivo. Ver lib/data/__tests__/users-store.test.ts.

import type { Role, User } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mapeo de filas
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUserInfo {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Combina las filas de profiles con los datos de auth.users
 * correspondientes. El email y la fecha de creación "de verdad" vienen
 * de auth.users (fuente de identidad); el resto (nombre, username,
 * rol, estado) viene de profiles. Si por algún motivo un profile no
 * tiene su auth.users correspondiente en el mapa (no debería pasar,
 * profiles.id -> auth.users.id es FK), se usa lo que haya en profiles
 * como respaldo en vez de romper el listado completo.
 */
export function mapUsersFromRows(
  profiles: ProfileRow[],
  authUsersById: Map<string, AuthUserInfo>
): User[] {
  return profiles.map((profile) => {
    const authUser = authUsersById.get(profile.id);
    return {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      email: authUser?.email || profile.email,
      role: profile.role,
      isActive: profile.active,
      avatarUrl: profile.avatar_url ?? undefined,
      createdAt: new Date(authUser?.created_at ?? profile.created_at),
      updatedAt: new Date(profile.updated_at),
    };
  });
}

// ---------------------------------------------------------------------------
// Protección del último administrador (PASO 6 del pedido)
// ---------------------------------------------------------------------------

export interface AdminGuardSubject {
  id: string;
  role: Role;
  active: boolean;
}

/** Cuenta administradores activos, opcionalmente excluyendo un id (para "los demás admins"). */
export function countActiveAdmins(
  users: AdminGuardSubject[],
  excludeId?: string
): number {
  return users.filter(
    (user) => user.role === "ADMIN" && user.active && user.id !== excludeId
  ).length;
}

export interface GuardResult {
  allowed: boolean;
  reason?: string;
}

/**
 * No permite que el último ADMIN activo sea desactivado. Si el usuario
 * objetivo no es un ADMIN activo, desactivarlo nunca corre ese riesgo
 * (no hay nada que proteger) y se permite.
 */
export function canDeactivateUser(
  users: AdminGuardSubject[],
  targetId: string
): GuardResult {
  const target = users.find((user) => user.id === targetId);
  if (!target || target.role !== "ADMIN" || !target.active) {
    return { allowed: true };
  }

  const remainingActiveAdmins = countActiveAdmins(users, targetId);
  if (remainingActiveAdmins === 0) {
    return {
      allowed: false,
      reason: "No puedes desactivar al último administrador activo.",
    };
  }

  return { allowed: true };
}

/**
 * No permite que el último ADMIN activo cambie su rol a VENDEDOR.
 * Igual que canDeactivateUser, solo aplica si el usuario objetivo es
 * hoy un ADMIN activo y el rol nuevo ya no lo es.
 */
export function canChangeRoleAway(
  users: AdminGuardSubject[],
  targetId: string,
  nextRole: Role
): GuardResult {
  const target = users.find((user) => user.id === targetId);
  if (!target || target.role !== "ADMIN" || !target.active || nextRole === "ADMIN") {
    return { allowed: true };
  }

  const remainingActiveAdmins = countActiveAdmins(users, targetId);
  if (remainingActiveAdmins === 0) {
    return {
      allowed: false,
      reason: "No puedes cambiar el rol del último administrador activo.",
    };
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Autorización (PASO 7 del pedido)
// ---------------------------------------------------------------------------

/**
 * Único criterio para poder ejecutar acciones administrativas de
 * /usuarios: estar autenticado, tener perfil, ser ADMIN y estar
 * activo. Coincide con lib/permissions.ts (PERMISOS_POR_ROL.ADMIN
 * .usuarios.administrar = true, el único rol con ese permiso hoy);
 * no se importa esa matriz directamente aquí porque lib/permissions.ts
 * hace `import { Role } from "./types"` (importación de un tipo como
 * valor), que node --test no puede ejecutar sin una transformación TS
 * completa (ver lib/data/__tests__/users-store.test.ts). Un VENDEDOR
 * (o un ADMIN desactivado) nunca cumple esto, sin importar qué botones
 * muestre o esconda la UI. Usada por lib/auth/require-admin.ts (que sí
 * depende de la sesión real) y probada aquí de forma aislada.
 */
export function isAdminProfile(
  profile: { role: Role; active: boolean } | null | undefined
): boolean {
  return !!profile && profile.role === "ADMIN" && profile.active;
}

// ---------------------------------------------------------------------------
// Errores de Supabase Auth
// ---------------------------------------------------------------------------

/**
 * Traduce errores conocidos de Supabase Auth Admin a mensajes en
 * español que se puedan mostrar en el formulario. Cualquier error no
 * reconocido cae en un mensaje genérico (nunca se expone el mensaje
 * crudo de Supabase, que puede filtrar detalles internos).
 */
export function translateSupabaseAuthError(
  error: { message?: string } | null | undefined
): string {
  const message = error?.message?.toLowerCase() ?? "";

  if (
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("duplicate")
  ) {
    return "Ese email ya está registrado en Supabase Auth.";
  }
  if (message.includes("password")) {
    return "La contraseña no cumple los requisitos mínimos de Supabase.";
  }
  if (message.includes("email") && (message.includes("invalid") || message.includes("valid"))) {
    return "El email no tiene un formato válido para Supabase Auth.";
  }
  if (message.includes("user not found")) {
    return "El usuario ya no existe en Supabase Auth.";
  }

  return "Ocurrió un error al comunicarse con Supabase Auth. Intenta nuevamente.";
}
