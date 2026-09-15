// Pruebas del modo "Twilio no configurado" (PASO 19), de la ventana de
// programación de Twilio Message Scheduling (PASO 9/10/11), y de la
// adaptación mínima al Trial de WhatsApp (Account SID + Auth Token +
// From fijo + ContentSid, sin Messaging Service).

import test from "node:test";
import assert from "node:assert/strict";

const TWILIO_ENV_KEYS = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_MESSAGING_SERVICE_SID",
  "TWILIO_WHATSAPP_CONTENT_SID",
  "TWILIO_WHATSAPP_FROM_NUMBER",
  "TWILIO_ADMIN_WHATSAPP_NUMBER",
] as const;

function clearTwilioEnv() {
  for (const key of TWILIO_ENV_KEYS) delete process.env[key];
}

clearTwilioEnv();

const {
  isTwilioConfigured,
  getTwilioConfig,
  sendWhatsAppMessage,
  cancelScheduledMessage,
  sendClientAppointmentConfirmation,
  sendAdminAppointmentNotification,
  getSchedulingWindowError,
  buildImmediateSendParams,
  TWILIO_MIN_SCHEDULE_LEAD_MS,
  TWILIO_MAX_SCHEDULE_LEAD_MS,
} = await import("../twilio");

// Valores reales del Trial (.env.local), usados solo como fixtures de
// prueba: no son secretos (el Account SID/Content SID de Twilio son
// identificadores públicos, y aquí nunca se usa el Auth Token real).
const TRIAL_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const TRIAL_AUTH_TOKEN = "fake-trial-auth-token";
const TRIAL_CONTENT_SID = "HXb5b62575e6e4ff6129ad7c8efe1f983e";
const TRIAL_FROM_NUMBER = "+17372508034";

function setTrialEnv() {
  clearTwilioEnv();
  process.env.TWILIO_ACCOUNT_SID = TRIAL_ACCOUNT_SID;
  process.env.TWILIO_AUTH_TOKEN = TRIAL_AUTH_TOKEN;
  process.env.TWILIO_WHATSAPP_CONTENT_SID = TRIAL_CONTENT_SID;
  process.env.TWILIO_WHATSAPP_FROM_NUMBER = TRIAL_FROM_NUMBER;
  // Deliberadamente vacíos, como en el Trial:
  process.env.TWILIO_MESSAGING_SERVICE_SID = "";
  process.env.TWILIO_ADMIN_WHATSAPP_NUMBER = "";
}

test("isTwilioConfigured() es false sin variables de entorno", () => {
  clearTwilioEnv();
  assert.equal(isTwilioConfigured(), false);
  assert.equal(getTwilioConfig(), null);
});

test("isTwilioConfigured() es true con las 4 variables del Trial, aunque MESSAGING_SERVICE_SID y ADMIN_WHATSAPP_NUMBER estén vacíos", () => {
  setTrialEnv();
  try {
    assert.equal(isTwilioConfigured(), true);

    const config = getTwilioConfig();
    assert.ok(config);
    assert.equal(config?.accountSid, TRIAL_ACCOUNT_SID);
    assert.equal(config?.authToken, TRIAL_AUTH_TOKEN);
    assert.equal(config?.contentSid, TRIAL_CONTENT_SID);
    assert.equal(config?.fromNumber, TRIAL_FROM_NUMBER);
    assert.equal(config?.messagingServiceSid, undefined);
    assert.equal(config?.adminWhatsappNumber, undefined);
  } finally {
    clearTwilioEnv();
  }
});

test("isTwilioConfigured() es false si falta TWILIO_WHATSAPP_FROM_NUMBER (aunque el resto del Trial esté completo)", () => {
  setTrialEnv();
  try {
    delete process.env.TWILIO_WHATSAPP_FROM_NUMBER;
    assert.equal(isTwilioConfigured(), false);
    assert.equal(getTwilioConfig(), null);
  } finally {
    clearTwilioEnv();
  }
});

test("buildImmediateSendParams() usa From = whatsapp:+17372508034 y ContentSid del Trial, sin MessagingServiceSid ni AuthToken en el payload", () => {
  const params = buildImmediateSendParams(
    { fromNumber: TRIAL_FROM_NUMBER, contentSid: TRIAL_CONTENT_SID },
    "whatsapp:+593987654321",
    { "1": "Michelle Andrade" }
  );

  assert.equal(params.from, "whatsapp:+17372508034");
  assert.equal(params.contentSid, "HXb5b62575e6e4ff6129ad7c8efe1f983e");
  assert.equal(params.to, "whatsapp:+593987654321");
  assert.deepEqual(JSON.parse(params.contentVariables as string), {
    "1": "Michelle Andrade",
  });

  // Nunca debe viajar el Auth Token (ni ningún otro dato) en el payload
  // del mensaje: solo se usa para construir el cliente de Twilio.
  assert.equal("messagingServiceSid" in params, false);
  assert.equal("authToken" in params, false);
  assert.equal("accountSid" in params, false);
  assert.equal(JSON.stringify(params).includes(TRIAL_AUTH_TOKEN), false);
});

test("sendWhatsAppMessage()/getTwilioConfig() nunca exponen el Auth Token en un mensaje de error", async () => {
  setTrialEnv();
  try {
    // Teléfono inválido: falla antes de llamar a Twilio, pero igual se
    // verifica que el error devuelto (lo único "logueable" desde fuera
    // de este módulo) nunca contenga el Auth Token real.
    const result = await sendWhatsAppMessage({
      to: "no-es-un-telefono",
      contentVariables: {},
    });
    assert.equal(result.success, false);
    assert.equal(result.error?.includes(TRIAL_AUTH_TOKEN), false);
    assert.equal(JSON.stringify(result).includes(TRIAL_AUTH_TOKEN), false);
  } finally {
    clearTwilioEnv();
  }
});

test("sendWhatsAppMessage() no llama a Twilio y avisa que no está configurado", async () => {
  clearTwilioEnv();
  const result = await sendWhatsAppMessage({
    to: "0987654321",
    contentVariables: { "1": "Prueba" },
  });
  assert.equal(result.success, false);
  assert.equal(result.error, "Twilio no está configurado.");
  assert.equal(result.sid, undefined);
});

test("cancelScheduledMessage() no lanza cuando Twilio no está configurado", async () => {
  clearTwilioEnv();
  const result = await cancelScheduledMessage("SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  assert.equal(result.success, false);
  assert.equal(result.error, "Twilio no está configurado.");
});

test("sendWhatsAppMessage() no rompe con teléfono inválido, aunque Twilio esté configurado", async () => {
  setTrialEnv();

  try {
    const result = await sendWhatsAppMessage({
      to: "no-es-un-telefono",
      contentVariables: {},
    });
    assert.equal(result.success, false);
    assert.equal(result.error, "Número de teléfono inválido.");
  } finally {
    clearTwilioEnv();
  }
});

test("sendClientAppointmentConfirmation() / sendAdminAppointmentNotification() degradan sin romper si Twilio no está configurado", async () => {
  clearTwilioEnv();
  const appointment = {
    clientName: "Michelle Andrade",
    serviceName: "Lifting de pestañas",
    professionalName: "Camila",
    date: "2026-09-10",
    time: "10:00",
    duration: 60,
  };

  const clientResult = await sendClientAppointmentConfirmation(appointment, {
    phone: "0987654321",
  });
  assert.equal(clientResult.success, false);
  assert.equal(clientResult.error, "Twilio no está configurado.");

  const adminResult = await sendAdminAppointmentNotification(appointment);
  assert.equal(adminResult.success, false);
  assert.equal(adminResult.error, "Twilio no está configurado.");
});

test("getSchedulingWindowError() rechaza un horario en el pasado", () => {
  const now = new Date("2026-09-10T10:00:00.000Z");
  const past = new Date("2026-09-10T09:00:00.000Z");
  assert.equal(
    getSchedulingWindowError(past, now),
    "El horario del recordatorio ya pasó."
  );
});

test("getSchedulingWindowError() rechaza menos de 15 minutos en el futuro (mínimo de Twilio)", () => {
  const now = new Date("2026-09-10T10:00:00.000Z");
  const tooSoon = new Date(now.getTime() + TWILIO_MIN_SCHEDULE_LEAD_MS - 60_000);
  assert.match(getSchedulingWindowError(tooSoon, now) ?? "", /fuera de la ventana/i);
});

test("getSchedulingWindowError() rechaza más de 7 días en el futuro (máximo de Twilio)", () => {
  const now = new Date("2026-09-10T10:00:00.000Z");
  const tooFar = new Date(now.getTime() + TWILIO_MAX_SCHEDULE_LEAD_MS + 60_000);
  assert.match(getSchedulingWindowError(tooFar, now) ?? "", /fuera de la ventana/i);
});

test("getSchedulingWindowError() acepta un horario dentro de la ventana (24h antes)", () => {
  const now = new Date("2026-09-10T10:00:00.000Z");
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  assert.equal(getSchedulingWindowError(in24h, now), null);
});
