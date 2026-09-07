// Superposición de ediciones de perfil sobre los usuarios mock.
//
// Los datos base siguen viviendo en lib/mocks/users.ts (representan lo
// que hoy vendría de la base de datos). Esto guarda aparte, por
// usuario y en localStorage, solo los campos que la persona editó
// desde /perfil, para simular una actualización persistente sin tocar
// el mock ni depender de un backend real. Cuando exista una API real,
// updateCurrentUser (lib/auth/session-context.tsx) pasaría a llamarla
// y este archivo dejaría de ser necesario; el resto de la app seguiría
// leyendo el usuario a través de findUserById/findUserByEmail.

import type { User } from "@/lib/types";

export type ProfileOverride = Partial<
  Pick<User, "name" | "username" | "email" | "avatarUrl">
>;

const PROFILE_OVERRIDES_STORAGE_KEY = "vega-studio:profile-overrides";

function readOverrides(): Record<string, ProfileOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROFILE_OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, ProfileOverride>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PROFILE_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides)
    );
  } catch {
    // Almacenamiento no disponible: las ediciones de perfil simplemente
    // no persisten entre recargas.
  }
}

/** Aplica, si existen, las ediciones guardadas de este usuario. */
export function applyProfileOverride(user: User): User {
  const override = readOverrides()[user.id];
  return override ? { ...user, ...override } : user;
}

export function saveProfileOverride(
  userId: string,
  updates: ProfileOverride
): void {
  const overrides = readOverrides();
  const next: ProfileOverride = { ...overrides[userId], ...updates };

  // Los object URL (blob:) de URL.createObjectURL solo son válidos
  // durante la sesión de navegación en la que se crearon: si se
  // guardaran aquí, tras recargar la página apuntarían a un blob ya
  // liberado y la imagen se vería rota. Mientras no exista subida real
  // de archivos, el avatar recién elegido se refleja en el usuario de
  // la sesión (session-context) pero no se persiste entre recargas.
  if (next.avatarUrl?.startsWith("blob:")) {
    delete next.avatarUrl;
  }

  overrides[userId] = next;
  writeOverrides(overrides);
}
