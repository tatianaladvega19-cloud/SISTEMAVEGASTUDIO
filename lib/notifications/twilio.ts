// Capa de servidor para el envío de WhatsApp vía Twilio. SOLO debe
// ejecutarse en el servidor: nunca se importa desde un componente
// "use client" (ver guardWhenClient más abajo) y TWILIO_AUTH_TOKEN
// nunca sale de este módulo (no se loguea, no se devuelve en ningún
// resultado ni acción).
//
// Mientras no existan las 4 variables de entorno mínimas para el envío
// inmediato (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
// TWILIO_WHATSAPP_CONTENT_SID, TWILIO_WHATSAPP_FROM_NUMBER), ninguna
// función de aquí llama a la API real de Twilio: todas devuelven
// { success: false, error: "Twilio no está configurado." } de forma
// controlada, para que la Agenda siga funcionando en modo desarrollo
// (PASO 19).
//
// Cuenta Trial de Twilio (adaptación mínima): el envío inmediato usa
// Account SID + Auth Token directamente (sin Messaging Service) y el
// número fijo TWILIO_WHATSAPP_FROM_NUMBER como remitente
// ("whatsapp:+1..."), en vez de MessagingServiceSid. Por eso
// TWILIO_MESSAGING_SERVICE_SID y TWILIO_ADMIN_WHATSAPP_NUMBER quedan
// como opcionales: pueden llegar vacíos durante el Trial y no deben
// bloquear isTwilioConfigured(). El Message Scheduling
// (scheduleClientReminder24h/1h) sigue reutilizando este mismo armado
// de parámetros por ahora; sus restricciones propias del Trial se
// resuelven en una segunda etapa.

import type { Client } from "../types";
import { formatAgendaDate } from "../utils/agenda";
import { formatDuration } from "../utils/format";
import { normalizePhoneToE164 } from "./phone";

function guardWhenClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "lib/notifications/twilio.ts solo puede ejecutarse en el servidor."
    );
  }
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  contentSid: string;
  /** Remitente de WhatsApp del Trial, sin el prefijo "whatsapp:" (p. ej. "+17372508034"). */
  fromNumber: string;
  /** Opcional durante el Trial: no se usa para el envío inmediato (ver sendWhatsAppMessage). */
  messagingServiceSid?: string;
  /** Número del estudio/administradora. Opcional durante el Trial: puede llegar vacío. */
  adminWhatsappNumber?: string;
}

export function getTwilioConfig(): TwilioConfig | null {
  guardWhenClient();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const adminWhatsappNumber = process.env.TWILIO_ADMIN_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !contentSid || !fromNumber) {
    return null;
  }

  return {
    accountSid,
    authToken,
    contentSid,
    fromNumber,
    messagingServiceSid: messagingServiceSid || undefined,
    adminWhatsappNumber: adminWhatsappNumber || undefined,
  };
}

export function isTwilioConfigured(): boolean {
  return getTwilioConfig() !== null;
}

const NOT_CONFIGURED_ERROR = "Twilio no está configurado.";

// El SDK de Twilio solo se importa cuando realmente hace falta enviar
// algo (config completa presente). Así, en modo desarrollo sin
// credenciales, el paquete "twilio" ni siquiera se carga.
// El paquete "twilio" se exporta con `export =` (CommonJS): el tipo que
// resulta de importarlo dinámicamente no es fácil de nombrar de forma
// estable entre versiones del SDK, así que el cliente se maneja como
// `unknown`/`any` en los pocos puntos donde se usa (igual que las
// llamadas a `.messages.create`/`.messages(sid).update` más abajo).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedClient: any = null;

async function getTwilioClient(config: TwilioConfig) {
  guardWhenClient();
  if (!cachedClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const twilioModule: any = await import("twilio");
    const TwilioCtor = twilioModule.default ?? twilioModule;
    cachedClient = TwilioCtor(config.accountSid, config.authToken);
  }
  return cachedClient;
}

export interface SendResult {
  success: boolean;
  /** SID del mensaje (enviado o programado) devuelto por Twilio. */
  sid?: string;
  error?: string;
}

export interface SendWhatsAppMessageInput {
  /** Teléfono en cualquier formato; se normaliza a E.164 aquí. */
  to: string;
  /** Variables {{1}}, {{2}}, ... del Content Template de WhatsApp. */
  contentVariables: Record<string, string>;
  /** Si viene, el mensaje se programa (Twilio Message Scheduling) en vez de enviarse ya. */
  sendAt?: Date;
}

// Arma el payload de Twilio para el envío inmediato del Trial: From
// (número fijo, sin Messaging Service) + ContentSid + contentVariables.
// Aislado en su propia función (sin llamar a Twilio) para poder probar
// el armado exacto de los parámetros sin credenciales reales. No incluye
// accountSid/authToken: esos solo se usan para construir el cliente
// (getTwilioClient), nunca viajan en el payload del mensaje ni se
// devuelven en el resultado.
export function buildImmediateSendParams(
  config: Pick<TwilioConfig, "fromNumber" | "contentSid">,
  to: string,
  contentVariables: Record<string, string>
): Record<string, unknown> {
  return {
    from: `whatsapp:${config.fromNumber}`,
    contentSid: config.contentSid,
    contentVariables: JSON.stringify(contentVariables),
    to,
  };
}

// Función base reutilizable: normaliza el teléfono, arma el payload
// con From + ContentSid (Trial, ver buildImmediateSendParams) y llama
// a Twilio. Nunca lanza: cualquier fallo (config, teléfono inválido,
// error de Twilio) se devuelve como { success: false, error }.
export async function sendWhatsAppMessage(
  input: SendWhatsAppMessageInput
): Promise<SendResult> {
  guardWhenClient();

  const config = getTwilioConfig();
  if (!config) {
    return { success: false, error: NOT_CONFIGURED_ERROR };
  }

  const normalized = normalizePhoneToE164(input.to);
  if (!normalized) {
    return { success: false, error: "Número de teléfono inválido." };
  }

  try {
    const client = await getTwilioClient(config);

    const params = buildImmediateSendParams(
      config,
      normalized.whatsapp,
      input.contentVariables
    );

    if (input.sendAt) {
      params.scheduleType = "fixed";
      params.sendAt = input.sendAt.toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = await (client as any).messages.create(params);
    return { success: true, sid: message.sid as string };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al enviar el WhatsApp.",
    };
  }
}

export async function cancelScheduledMessage(sid: string): Promise<SendResult> {
  guardWhenClient();

  const config = getTwilioConfig();
  if (!config) {
    return { success: false, error: NOT_CONFIGURED_ERROR };
  }

  try {
    const client = await getTwilioClient(config);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client as any).messages(sid).update({ status: "canceled" });
    return { success: true, sid };
  } catch (error) {
    // Un mensaje ya enviado no se puede cancelar; Twilio lo rechaza con
    // un error. No es un caso que deba romper la reprogramación/
    // cancelación de la cita, solo se reporta.
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el mensaje programado.",
    };
  }
}

// ---------------------------------------------------------------------------
// Mensajes de negocio (PASO 7/8/9/10)
// ---------------------------------------------------------------------------

interface AppointmentMessageData {
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
}

function buildAppointmentContentVariables(
  appointment: AppointmentMessageData
): Record<string, string> {
  return {
    "1": appointment.clientName,
    "2": appointment.serviceName,
    "3": appointment.professionalName,
    "4": formatAgendaDate(appointment.date),
    "5": appointment.time,
    "6": formatDuration(appointment.duration),
  };
}

export async function sendClientAppointmentConfirmation(
  appointment: AppointmentMessageData,
  client: Pick<Client, "phone">
): Promise<SendResult> {
  return sendWhatsAppMessage({
    to: client.phone,
    contentVariables: buildAppointmentContentVariables(appointment),
  });
}

export async function sendAdminAppointmentNotification(
  appointment: AppointmentMessageData
): Promise<SendResult> {
  const config = getTwilioConfig();
  if (!config) {
    return { success: false, error: NOT_CONFIGURED_ERROR };
  }
  if (!config.adminWhatsappNumber) {
    return {
      success: false,
      error: "TWILIO_ADMIN_WHATSAPP_NUMBER no está configurado.",
    };
  }

  return sendWhatsAppMessage({
    to: config.adminWhatsappNumber,
    contentVariables: buildAppointmentContentVariables(appointment),
  });
}

// ---------------------------------------------------------------------------
// Twilio Message Scheduling (PASO 9/10/11)
// ---------------------------------------------------------------------------

// Restricciones reales de Twilio Message Scheduling: SendAt debe caer
// entre 15 minutos y 7 días en el futuro. No es parte del enunciado del
// negocio, es una limitación del proveedor: si no se respeta, la
// llamada a la API falla. Se valida antes de llamar para dar un error
// claro ("fuera de ventana") en vez de propagar el error crudo de Twilio.
export const TWILIO_MIN_SCHEDULE_LEAD_MS = 15 * 60 * 1000;
export const TWILIO_MAX_SCHEDULE_LEAD_MS = 7 * 24 * 60 * 60 * 1000;

export function getSchedulingWindowError(
  scheduledFor: Date,
  now: Date = new Date()
): string | null {
  const leadMs = scheduledFor.getTime() - now.getTime();

  if (leadMs <= 0) {
    return "El horario del recordatorio ya pasó.";
  }
  if (leadMs < TWILIO_MIN_SCHEDULE_LEAD_MS) {
    return "Faltan menos de 15 minutos: fuera de la ventana de programación de Twilio.";
  }
  if (leadMs > TWILIO_MAX_SCHEDULE_LEAD_MS) {
    return "Faltan más de 7 días: fuera de la ventana de programación de Twilio.";
  }
  return null;
}

async function scheduleClientReminder(
  appointment: AppointmentMessageData,
  client: Pick<Client, "phone">,
  scheduledFor: Date
): Promise<SendResult> {
  const windowError = getSchedulingWindowError(scheduledFor);
  if (windowError) {
    return { success: false, error: windowError };
  }

  return sendWhatsAppMessage({
    to: client.phone,
    contentVariables: buildAppointmentContentVariables(appointment),
    sendAt: scheduledFor,
  });
}

export async function scheduleClientReminder24h(
  appointment: AppointmentMessageData,
  client: Pick<Client, "phone">,
  scheduledFor: Date
): Promise<SendResult> {
  return scheduleClientReminder(appointment, client, scheduledFor);
}

export async function scheduleClientReminder1h(
  appointment: AppointmentMessageData,
  client: Pick<Client, "phone">,
  scheduledFor: Date
): Promise<SendResult> {
  return scheduleClientReminder(appointment, client, scheduledFor);
}
