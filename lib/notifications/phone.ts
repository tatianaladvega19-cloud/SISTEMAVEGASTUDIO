// Normalización de números de teléfono a formato E.164 para WhatsApp
// (Twilio). Función pura, sin dependencias del proyecto, para que sea
// fácil de probar de forma aislada (ver __tests__/phone.test.ts).
//
// Ecuador (código por defecto) guarda los teléfonos en el formato local
// de 10 dígitos con troncal "0" (p. ej. "0987654321"). E.164 exige quitar
// esa troncal y anteponer el código de país: "+593987654321".

export const DEFAULT_COUNTRY_CODE = "593";

export interface NormalizedPhone {
  /** Formato E.164, p. ej. "+593987654321". */
  e164: string;
  /** Listo para usarse como `To`/`From` de WhatsApp en Twilio. */
  whatsapp: string;
}

// Un número E.164 válido: "+" seguido de 8 a 15 dígitos, sin ceros a la
// izquierda en el código de país (regla general del estándar).
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneToE164(
  rawPhone: string | null | undefined,
  defaultCountryCode: string = DEFAULT_COUNTRY_CODE
): NormalizedPhone | null {
  if (!rawPhone) return null;

  const trimmed = rawPhone.trim();
  if (!trimmed) return null;

  // Ya viene con "+": se respeta el código de país que traiga.
  if (trimmed.startsWith("+")) {
    const digitsOnly = trimmed.slice(1).replace(/\D/g, "");
    const candidate = `+${digitsOnly}`;
    return E164_PATTERN.test(candidate) ? toResult(candidate) : null;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return null;

  let national: string;
  if (digitsOnly.startsWith("0")) {
    // Formato local con troncal, p. ej. "0987654321" -> "987654321".
    national = `${defaultCountryCode}${digitsOnly.slice(1)}`;
  } else if (digitsOnly.startsWith(defaultCountryCode)) {
    // Ya trae el código de país pero sin "+".
    national = digitsOnly;
  } else {
    // Número corto sin troncal ni código de país: se antepone el código.
    national = `${defaultCountryCode}${digitsOnly}`;
  }

  const candidate = `+${national}`;
  return E164_PATTERN.test(candidate) ? toResult(candidate) : null;
}

function toResult(e164: string): NormalizedPhone {
  return { e164, whatsapp: `whatsapp:${e164}` };
}
