// Verificación de sesión/rol para las operaciones administrativas de
// /usuarios. Server-only: se apoya en lib/supabase/server.ts (cliente
// con cookies de la petición real, respeta RLS) para averiguar QUIÉN
// está autenticado, y en lib/auth/session.ts (fetchProfile) para leer
// su rol desde `profiles` bajo la policy "profiles_select_own" (cada
// quien puede leer su propia fila).
//
// Este módulo no otorga privilegios por sí mismo: solo responde "¿esta
// sesión pertenece a un ADMIN activo?". Cada Server Action de
// /usuarios debe llamar a requireAdminProfile() al inicio (ver PASO 7
// del pedido: "No confíes solamente en ocultar botones del frontend").

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { fetchProfile } from "./session";
import { isAdminProfile } from "@/lib/data/users-rules";
import type { User } from "@/lib/types";

export class UnauthorizedError extends Error {
  constructor(message = "No autorizado.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Perfil del usuario autenticado en la sesión actual, o null si no hay sesión o no tiene perfil. */
export async function getAuthenticatedProfile(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return fetchProfile(supabase, data.user.id);
}

/**
 * Exige que la sesión actual pertenezca a un ADMIN activo. Lanza
 * UnauthorizedError (nunca devuelve un perfil de otro rol) para que
 * cada Server Action pueda distinguir este caso de un error de datos.
 */
export async function requireAdminProfile(): Promise<User> {
  const profile = await getAuthenticatedProfile();

  if (!profile) {
    throw new UnauthorizedError("Debes iniciar sesión para continuar.");
  }
  if (!isAdminProfile({ role: profile.role, active: profile.isActive })) {
    throw new UnauthorizedError(
      "Solo un administrador activo puede administrar usuarios."
    );
  }

  return profile;
}
