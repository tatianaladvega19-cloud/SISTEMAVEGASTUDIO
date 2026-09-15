// Pruebas de normalización de teléfono a WhatsApp/E.164 (PASO 6 y 22).
// Se ejecutan con el test runner nativo de Node: `node --test`.

import test from "node:test";
import assert from "node:assert/strict";
import { normalizePhoneToE164 } from "../phone";

test("normaliza un número local de Ecuador con troncal 0", () => {
  const result = normalizePhoneToE164("0987654321");
  assert.deepEqual(result, {
    e164: "+593987654321",
    whatsapp: "whatsapp:+593987654321",
  });
});

test("acepta números con espacios y guiones", () => {
  const result = normalizePhoneToE164("098-765-4321");
  assert.equal(result?.e164, "+593987654321");
});

test("respeta un número que ya viene en E.164", () => {
  const result = normalizePhoneToE164("+593987654321");
  assert.equal(result?.e164, "+593987654321");
});

test("acepta un número que ya trae el código de país sin '+'", () => {
  const result = normalizePhoneToE164("593987654321");
  assert.equal(result?.e164, "+593987654321");
});

test("devuelve null para teléfono vacío", () => {
  assert.equal(normalizePhoneToE164(""), null);
  assert.equal(normalizePhoneToE164(undefined), null);
  assert.equal(normalizePhoneToE164(null), null);
});

test("devuelve null para teléfono inválido (muy corto)", () => {
  assert.equal(normalizePhoneToE164("123"), null);
});

test("el resultado whatsapp: incluye el prefijo requerido por Twilio", () => {
  const result = normalizePhoneToE164("0912345678");
  assert.equal(result?.whatsapp, "whatsapp:+593912345678");
});
