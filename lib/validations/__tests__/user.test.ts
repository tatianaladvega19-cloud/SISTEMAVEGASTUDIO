// Pruebas de lib/validations/user.ts (formulario de alta/edición de
// /usuarios). Mismo patrón que el resto de lib/validations/*: son
// funciones puras, así que se prueban directamente sin Supabase.

import test from "node:test";
import assert from "node:assert/strict";
import {
  validateUserFields,
  validatePasswordFields,
  type UserFormValues,
} from "../user";

const notTaken = () => false;
const alwaysTaken = () => true;

function buildValues(overrides: Partial<UserFormValues> = {}): UserFormValues {
  return {
    name: "María Fernanda López",
    username: "maria.lopez",
    email: "maria@vegastudio.com",
    role: "VENDEDOR",
    ...overrides,
  };
}

test("validateUserFields(): valores completos y válidos no producen errores", () => {
  const errors = validateUserFields(buildValues(), notTaken, notTaken);
  assert.deepEqual(errors, {});
});

test("validateUserFields(): el nombre es obligatorio", () => {
  const errors = validateUserFields(buildValues({ name: "   " }), notTaken, notTaken);
  assert.ok(errors.name);
});

test("validateUserFields(): el username es obligatorio", () => {
  const errors = validateUserFields(buildValues({ username: "" }), notTaken, notTaken);
  assert.ok(errors.username);
});

test("validateUserFields(): rechaza un username ya en uso", () => {
  const errors = validateUserFields(buildValues(), alwaysTaken, notTaken);
  assert.ok(errors.username);
});

test("validateUserFields(): el email es obligatorio", () => {
  const errors = validateUserFields(buildValues({ email: "" }), notTaken, notTaken);
  assert.ok(errors.email);
});

test("validateUserFields(): rechaza un email con formato inválido", () => {
  const errors = validateUserFields(buildValues({ email: "no-es-un-email" }), notTaken, notTaken);
  assert.ok(errors.email);
});

test("validateUserFields(): rechaza un email ya en uso", () => {
  const errors = validateUserFields(buildValues(), notTaken, alwaysTaken);
  assert.ok(errors.email);
});

test("validateUserFields(): rechaza un rol fuera de ADMIN/VENDEDOR", () => {
  const errors = validateUserFields(
    buildValues({ role: "SUPERADMIN" as UserFormValues["role"] }),
    notTaken,
    notTaken
  );
  assert.ok(errors.role);
});

test("validatePasswordFields(): una contraseña válida y confirmada no produce errores", () => {
  const errors = validatePasswordFields("segura123", "segura123");
  assert.deepEqual(errors, {});
});

test("validatePasswordFields(): la contraseña es obligatoria", () => {
  const errors = validatePasswordFields("", "");
  assert.ok(errors.password);
});

test("validatePasswordFields(): exige un mínimo de caracteres", () => {
  const errors = validatePasswordFields("123", "123");
  assert.ok(errors.password);
});

test("validatePasswordFields(): la confirmación debe coincidir", () => {
  const errors = validatePasswordFields("segura123", "otra-cosa");
  assert.ok(errors.confirmPassword);
});
