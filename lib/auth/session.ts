// Sesión real de VEGA STUDIO, respaldada por Supabase Auth.
//
// Supabase Auth guarda quién inició sesión (email/contraseña, token,
// persistencia entre recargas); este módulo solo se encarga de la
// mitad que Supabase no sabe: mapear ese usuario autenticado a su fila
// en `profiles` (nombre, username, rol) para el resto de la app
// (Sidebar, Topbar, permisos por rol, etc.). Ver session-context.tsx
// para cómo se conecta esto con supabase.auth.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role, User } from "@/lib/types";

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

interface ProfileRow {
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

function mapProfileRow(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    role: row.role,
    isActive: row.active,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Busca en `profiles` la fila del usuario autenticado (profiles.id ==
 * auth.users.id, ver migración 20260915160000). Devuelve null tanto si
 * no existe la fila (cuenta de Auth sin perfil asignado todavía) como
 * si la consulta falla por RLS.
 */
export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username, email, role, active, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRow(data as ProfileRow);
}
