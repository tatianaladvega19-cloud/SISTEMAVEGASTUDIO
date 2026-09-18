// Capa de datos REAL del módulo Usuarios: Supabase Auth (auth.users) +
// public.profiles. Reemplaza a lib/mocks/users.ts para todo lo que
// use /usuarios (mismo patrón que lib/data/clients-store.ts,
// lib/data/professionals-store.ts, etc. para los demás módulos, salvo
// que aquí además se administra auth.users, por lo que se usa el
// cliente administrativo de lib/supabase/admin.ts en vez del cliente
// con cookies de lib/supabase/server.ts).
//
// Cada función exportada que lee o escribe datos llama primero a
// requireAdminProfile() (lib/auth/require-admin.ts): la autorización
// se verifica aquí, no solo en la UI (PASO 7 del pedido). Las reglas
// de negocio puras (mapeo de filas, protección del último
// administrador, traducción de errores) viven en
// lib/data/users-rules.ts y se prueban ahí: este archivo no se
// importa desde las pruebas porque "server-only" (más abajo) lanza un
// error fuera de un entorno de Server Components.

import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import {
  mapUsersFromRows,
  canDeactivateUser,
  canChangeRoleAway,
  translateSupabaseAuthError,
  type ProfileRow,
  type AuthUserInfo,
  type AdminGuardSubject,
} from "./users-rules";
import type { Role, User } from "@/lib/types";

export type {
  ProfileRow,
  AuthUserInfo,
  AdminGuardSubject,
  GuardResult,
} from "./users-rules";
export {
  mapUsersFromRows,
  countActiveAdmins,
  canDeactivateUser,
  canChangeRoleAway,
  isAdminProfile,
  translateSupabaseAuthError,
} from "./users-rules";

// ---------------------------------------------------------------------------
// Acceso a datos (Supabase) — requieren sesión de ADMIN activo
// ---------------------------------------------------------------------------

const PROFILE_COLUMNS =
  "id, name, username, email, role, active, avatar_url, created_at, updated_at";

async function fetchAllAuthUsers(
  admin: ReturnType<typeof createAdminClient>
): Promise<Map<string, AuthUserInfo>> {
  const authUsersById = new Map<string, AuthUserInfo>();
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(translateSupabaseAuthError(error));
    }

    for (const authUser of data.users) {
      authUsersById.set(authUser.id, {
        id: authUser.id,
        email: authUser.email ?? "",
        created_at: authUser.created_at,
      });
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return authUsersById;
}

async function fetchAllProfiles(
  admin: ReturnType<typeof createAdminClient>
): Promise<ProfileRow[]> {
  const { data, error } = await admin
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudo obtener el listado de usuarios.");
  }

  return (data ?? []) as ProfileRow[];
}

/** Lista los usuarios reales (auth.users + profiles). Exige sesión de ADMIN activo. */
export async function listUsers(): Promise<User[]> {
  await requireAdminProfile();
  const admin = createAdminClient();

  const [profiles, authUsersById] = await Promise.all([
    fetchAllProfiles(admin),
    fetchAllAuthUsers(admin),
  ]);

  return mapUsersFromRows(profiles, authUsersById);
}

function normalizeUniqueField(value: string): string {
  return value.trim().toLowerCase();
}

async function isFieldTaken(
  admin: ReturnType<typeof createAdminClient>,
  field: "username" | "email",
  value: string,
  excludeId?: string
): Promise<boolean> {
  const normalized = normalizeUniqueField(value);
  let query = admin.from("profiles").select(`id, ${field}`);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) throw new Error("No se pudo verificar la disponibilidad de los datos.");

  return (data ?? []).some(
    (row: Record<string, string>) => normalizeUniqueField(String(row[field])) === normalized
  );
}

export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  password: string;
}

/**
 * Crea el usuario en Supabase Auth y, con el UUID que Supabase asigna,
 * su fila en profiles. Si falla la creación del profile, se revierte
 * (borra) el usuario recién creado en Auth para no dejar una cuenta
 * huérfana (PASO 2 del pedido).
 */
export async function createUserAccount(input: CreateUserInput): Promise<User> {
  await requireAdminProfile();
  const admin = createAdminClient();

  const name = input.name.trim();
  const username = input.username.trim();
  const email = input.email.trim();

  if (await isFieldTaken(admin, "username", username)) {
    throw Object.assign(new Error("Ese nombre de usuario ya está en uso."), {
      field: "username",
    });
  }
  if (await isFieldTaken(admin, "email", email)) {
    throw Object.assign(new Error("Ese email ya está en uso."), { field: "email" });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });

  if (createError || !created?.user) {
    throw new Error(translateSupabaseAuthError(createError));
  }

  const authUserId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: authUserId,
    name,
    username,
    email,
    role: input.role,
    active: input.isActive,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authUserId);
    throw new Error(
      "No se pudo crear el perfil del usuario, se revirtió la cuenta creada. Verifica los datos e intenta nuevamente."
    );
  }

  return {
    id: authUserId,
    name,
    username,
    email,
    role: input.role,
    isActive: input.isActive,
    createdAt: new Date(created.user.created_at),
    updatedAt: new Date(),
  };
}

export interface UpdateUserInput {
  name: string;
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  /** Solo presente si el admin decidió definir una nueva contraseña. */
  password?: string;
}

/**
 * Edita nombre/username/email/rol/estado y, opcionalmente, email o
 * contraseña en Supabase Auth (PASO 3 y 4 del pedido). Aplica las
 * protecciones de "último administrador" (PASO 6) antes de escribir
 * nada.
 */
export async function updateUserAccount(
  id: string,
  input: UpdateUserInput
): Promise<User> {
  await requireAdminProfile();
  const admin = createAdminClient();

  const [profiles, authUsersById] = await Promise.all([
    fetchAllProfiles(admin),
    fetchAllAuthUsers(admin),
  ]);

  const currentProfile = profiles.find((profile) => profile.id === id);
  if (!currentProfile) {
    throw new Error("El usuario que intentas editar ya no existe.");
  }

  const name = input.name.trim();
  const username = input.username.trim();
  const email = input.email.trim();

  if (await isFieldTaken(admin, "username", username, id)) {
    throw Object.assign(new Error("Ese nombre de usuario ya está en uso."), {
      field: "username",
    });
  }
  if (await isFieldTaken(admin, "email", email, id)) {
    throw Object.assign(new Error("Ese email ya está en uso."), { field: "email" });
  }

  const guardSubjects: AdminGuardSubject[] = profiles.map((profile) => ({
    id: profile.id,
    role: profile.role,
    active: profile.active,
  }));

  if (!input.isActive) {
    const guard = canDeactivateUser(guardSubjects, id);
    if (!guard.allowed) throw new Error(guard.reason);
  }

  const roleGuard = canChangeRoleAway(guardSubjects, id, input.role);
  if (!roleGuard.allowed) throw new Error(roleGuard.reason);

  const emailChanged =
    normalizeUniqueField(email) !== normalizeUniqueField(currentProfile.email);
  if (emailChanged || input.password) {
    const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, {
      ...(emailChanged ? { email, email_confirm: true } : {}),
      ...(input.password ? { password: input.password } : {}),
    });
    if (authUpdateError) {
      throw new Error(translateSupabaseAuthError(authUpdateError));
    }
  }

  const { error: profileUpdateError } = await admin
    .from("profiles")
    .update({
      name,
      username,
      email,
      role: input.role,
      active: input.isActive,
    })
    .eq("id", id);

  if (profileUpdateError) {
    throw new Error("No se pudo actualizar el perfil del usuario.");
  }

  const authUser = authUsersById.get(id);
  return {
    id,
    name,
    username,
    email,
    role: input.role,
    isActive: input.isActive,
    createdAt: new Date(authUser?.created_at ?? currentProfile.created_at),
    updatedAt: new Date(),
  };
}

/** Activa/desactiva un usuario (PASO 4 y 5 del pedido). Nunca borra la fila de profiles. */
export async function setUserActive(id: string, nextActive: boolean): Promise<void> {
  await requireAdminProfile();
  const admin = createAdminClient();

  if (!nextActive) {
    const profiles = await fetchAllProfiles(admin);
    const guardSubjects: AdminGuardSubject[] = profiles.map((profile) => ({
      id: profile.id,
      role: profile.role,
      active: profile.active,
    }));

    const guard = canDeactivateUser(guardSubjects, id);
    if (!guard.allowed) throw new Error(guard.reason);
  }

  const { error } = await admin.from("profiles").update({ active: nextActive }).eq("id", id);
  if (error) {
    throw new Error("No se pudo actualizar el estado del usuario.");
  }
}
