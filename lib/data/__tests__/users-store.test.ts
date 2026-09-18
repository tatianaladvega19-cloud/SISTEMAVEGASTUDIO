// Pruebas de las funciones puras de lib/data/users-rules.ts (mapeo de
// filas, reglas de "último administrador" y traducción de errores de
// Supabase Auth). Viven en esta carpeta por la misma razón que
// alerts-store.test.ts (ver ese archivo): package.json → "test" solo
// corre *.test.ts bajo estas carpetas con node --test.
//
// Se importa de users-rules.ts y no de users-store.ts a propósito:
// users-store.ts empieza con `import "server-only"`, que lanza un
// error si se importa fuera de un entorno de React Server Components
// (ver node_modules/server-only/package.json → export condition
// "react-server"), lo que rompería este archivo bajo node --test.
//
// listUsers/createUserAccount/updateUserAccount/setUserActive (las
// funciones async que sí llaman a Supabase, en users-store.ts) NO se
// prueban aquí: usan lib/supabase/admin.ts y lib/auth/require-admin.ts,
// que dependen de next/headers (cookies()) y de credenciales reales de
// Supabase, que este harness no tiene y no debe tener (no se usan
// credenciales reales en pruebas). Las reglas de negocio que esas
// funciones aplican (último administrador, unicidad, mapeo de filas)
// sí están cubiertas aquí porque viven en funciones puras
// independientes.

import test from "node:test";
import assert from "node:assert/strict";
import {
  mapUsersFromRows,
  countActiveAdmins,
  canDeactivateUser,
  canChangeRoleAway,
  isAdminProfile,
  translateSupabaseAuthError,
  type ProfileRow,
  type AuthUserInfo,
} from "../users-rules";

function buildProfile(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    id: "user-1",
    name: "Vanessa Vega",
    username: "vanessa.vega",
    email: "vanessa@vegastudio.com",
    role: "ADMIN",
    active: true,
    avatar_url: null,
    created_at: "2026-01-10T09:00:00.000Z",
    updated_at: "2026-01-10T09:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// mapUsersFromRows — "listar usuarios"
// ---------------------------------------------------------------------------

test("mapUsersFromRows(): usa el email y la fecha de creación de auth.users, no de profiles", () => {
  const profiles = [buildProfile({ email: "stale@vegastudio.com" })];
  const authUsersById = new Map<string, AuthUserInfo>([
    ["user-1", { id: "user-1", email: "vanessa@vegastudio.com", created_at: "2026-02-01T00:00:00.000Z" }],
  ]);

  const [user] = mapUsersFromRows(profiles, authUsersById);

  assert.equal(user.email, "vanessa@vegastudio.com");
  assert.equal(user.createdAt.toISOString(), "2026-02-01T00:00:00.000Z");
  assert.equal(user.name, "Vanessa Vega");
  assert.equal(user.role, "ADMIN");
  assert.equal(user.isActive, true);
});

test("mapUsersFromRows(): si falta el auth.users correspondiente, usa el respaldo de profiles", () => {
  const profiles = [buildProfile({ id: "orphan-1", email: "orphan@vegastudio.com" })];

  const [user] = mapUsersFromRows(profiles, new Map());

  assert.equal(user.email, "orphan@vegastudio.com");
  assert.equal(user.createdAt.toISOString(), "2026-01-10T09:00:00.000Z");
});

test("mapUsersFromRows(): no expone contraseñas ni ningún campo fuera del modelo User", () => {
  const profiles = [buildProfile()];
  const [user] = mapUsersFromRows(profiles, new Map());

  assert.deepEqual(Object.keys(user).sort(), [
    "avatarUrl",
    "createdAt",
    "email",
    "id",
    "isActive",
    "name",
    "role",
    "updatedAt",
    "username",
  ]);
});

// ---------------------------------------------------------------------------
// countActiveAdmins / canDeactivateUser / canChangeRoleAway — "protección del admin"
// ---------------------------------------------------------------------------

const oneAdminOneVendedor = [
  { id: "admin-1", role: "ADMIN" as const, active: true },
  { id: "vendedor-1", role: "VENDEDOR" as const, active: true },
];

const twoAdmins = [
  { id: "admin-1", role: "ADMIN" as const, active: true },
  { id: "admin-2", role: "ADMIN" as const, active: true },
];

test("countActiveAdmins(): cuenta solo ADMIN activos, excluyendo el id dado", () => {
  assert.equal(countActiveAdmins(twoAdmins), 2);
  assert.equal(countActiveAdmins(twoAdmins, "admin-1"), 1);
  assert.equal(countActiveAdmins(oneAdminOneVendedor, "admin-1"), 0);
});

test("canDeactivateUser(): impide desactivar al último administrador activo", () => {
  const result = canDeactivateUser(oneAdminOneVendedor, "admin-1");
  assert.equal(result.allowed, false);
  assert.match(result.reason ?? "", /último administrador/);
});

test("canDeactivateUser(): permite desactivar un administrador si queda otro activo", () => {
  const result = canDeactivateUser(twoAdmins, "admin-1");
  assert.equal(result.allowed, true);
});

test("canDeactivateUser(): permite desactivar a un VENDEDOR sin restricciones", () => {
  const result = canDeactivateUser(oneAdminOneVendedor, "vendedor-1");
  assert.equal(result.allowed, true);
});

test("canChangeRoleAway(): impide que el último administrador activo cambie su rol a VENDEDOR", () => {
  const result = canChangeRoleAway(oneAdminOneVendedor, "admin-1", "VENDEDOR");
  assert.equal(result.allowed, false);
  assert.match(result.reason ?? "", /último administrador/);
});

test("canChangeRoleAway(): permite el cambio de rol si queda otro administrador activo", () => {
  const result = canChangeRoleAway(twoAdmins, "admin-1", "VENDEDOR");
  assert.equal(result.allowed, true);
});

test("canChangeRoleAway(): mantenerse como ADMIN nunca está restringido", () => {
  const result = canChangeRoleAway(oneAdminOneVendedor, "admin-1", "ADMIN");
  assert.equal(result.allowed, true);
});

// ---------------------------------------------------------------------------
// isAdminProfile — "impedir que VENDEDOR ejecute acciones administrativas"
// ---------------------------------------------------------------------------

test("isAdminProfile(): un ADMIN activo está autorizado", () => {
  assert.equal(isAdminProfile({ role: "ADMIN", active: true }), true);
});

test("isAdminProfile(): un VENDEDOR nunca está autorizado, esté activo o no", () => {
  assert.equal(isAdminProfile({ role: "VENDEDOR", active: true }), false);
  assert.equal(isAdminProfile({ role: "VENDEDOR", active: false }), false);
});

test("isAdminProfile(): un ADMIN desactivado no está autorizado", () => {
  assert.equal(isAdminProfile({ role: "ADMIN", active: false }), false);
});

test("isAdminProfile(): sin sesión (perfil null/undefined) no está autorizado", () => {
  assert.equal(isAdminProfile(null), false);
  assert.equal(isAdminProfile(undefined), false);
});

// ---------------------------------------------------------------------------
// translateSupabaseAuthError — "manejo de errores de Supabase Auth"
// ---------------------------------------------------------------------------

test("translateSupabaseAuthError(): reconoce un email ya registrado", () => {
  const message = translateSupabaseAuthError({ message: "User already registered" });
  assert.match(message, /ya está registrado/);
});

test("translateSupabaseAuthError(): reconoce una contraseña inválida", () => {
  const message = translateSupabaseAuthError({ message: "Password should be at least 6 characters" });
  assert.match(message, /contraseña/);
});

test("translateSupabaseAuthError(): cae en un mensaje genérico para errores desconocidos, sin exponer el mensaje crudo", () => {
  const message = translateSupabaseAuthError({ message: "unexpected_internal_code_x92" });
  assert.doesNotMatch(message, /unexpected_internal_code_x92/);
});

test("translateSupabaseAuthError(): maneja un error nulo/indefinido sin lanzar", () => {
  assert.doesNotThrow(() => translateSupabaseAuthError(null));
  assert.doesNotThrow(() => translateSupabaseAuthError(undefined));
});
