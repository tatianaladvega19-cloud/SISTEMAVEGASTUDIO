// Frontera entre la aplicación y Supabase para los recordatorios de
// cita (public.appointment_reminders, ver
// supabase/migrations/20260909201050_initial_vega_studio_schema.sql).
// Mismo patrón que lib/data/appointments-store.ts: consulta
// directamente la tabla a través de lib/supabase/server.ts (key
// publishable/anon, nunca service_role).
//
// Cada cita tiene únicamente 2 recordatorios "activos" a la vez
// (REMINDER_24H/REMINDER_1H, siempre CLIENTA, siempre WHATSAPP): la
// administradora nunca tiene filas aquí (recibe solo el aviso
// inmediato, rastreado en appointments.admin_notification_*). Al
// reprogramar, los recordatorios anteriores NUNCA se borran: quedan en
// la tabla con status CANCELADA (historial completo) y se insertan 2
// filas nuevas para la nueva fecha/hora.
//
// Este módulo solo hace CRUD; decidir CUÁNDO cancelar/programar cada
// recordatorio (y llamar a Twilio) es responsabilidad de
// lib/notifications/appointment-notifications.ts, que nunca importa
// este archivo directamente: quien conecta ambos es
// app/(dashboard)/agenda/actions.ts.

import { computeReminderTime } from "@/lib/utils/notifications";
import type { AppointmentReminder, NotificationStatus, NotificationTiming } from "@/lib/types";

// lib/supabase/server.ts importa next/headers (cookies()), que solo
// resuelve dentro de una petición real de Next.js. Se importa de forma
// perezosa (dynamic import) para que las funciones puras de este
// archivo (mapRowToReminder, buildReminderInsertRows) se puedan probar
// con `node --test` sin cargar next/headers (mismo motivo que
// lib/notifications/twilio.ts importa el SDK de twilio de forma
// perezosa). No cambia el comportamiento en Next.js: sigue siendo el
// mismo cliente, solo que su import se resuelve la primera vez que
// hace falta.
async function getSupabaseServerClient() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

const REMINDER_SELECT = `
  id,
  appointment_id,
  type,
  recipient_role,
  channel,
  twilio_message_sid,
  scheduled_for,
  sent_at,
  status,
  created_at,
  updated_at
`;

type ReminderType = "REMINDER_24H" | "REMINDER_1H";

interface ReminderRow {
  id: string;
  appointment_id: string;
  type: ReminderType;
  recipient_role: "CLIENTA";
  channel: "WHATSAPP" | null;
  twilio_message_sid: string | null;
  scheduled_for: string;
  sent_at: string | null;
  status: NotificationStatus;
  created_at: string;
  updated_at: string;
}

const TYPE_TO_TIMING: Record<ReminderType, NotificationTiming> = {
  REMINDER_24H: "24H_ANTES",
  REMINDER_1H: "1H_ANTES",
};

const TIMING_TO_TYPE: Record<NotificationTiming, ReminderType> = {
  "24H_ANTES": "REMINDER_24H",
  "1H_ANTES": "REMINDER_1H",
};

const HOURS_BEFORE: Record<NotificationTiming, number> = {
  "24H_ANTES": 24,
  "1H_ANTES": 1,
};

// Pura, sin Supabase: traduce una fila de appointment_reminders al
// tipo AppointmentReminder de la aplicación. Exportada para poder
// probarla sin depender de lib/supabase/server.ts (ver
// lib/notifications/__tests__/appointment-reminders-store.test.ts).
export function mapRowToReminder(row: ReminderRow): AppointmentReminder {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    timing: TYPE_TO_TIMING[row.type],
    recipientRole: row.recipient_role,
    channel: row.channel ?? undefined,
    status: row.status,
    scheduledFor: new Date(row.scheduled_for),
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    providerMessageId: row.twilio_message_sid ?? undefined,
  };
}

// Pura, sin Supabase: arma las 2 filas (24h/1h, CLIENTA, PENDIENTE)
// que hay que insertar para una cita recién agendada o recién
// reprogramada. Exportada para poder probarla igual que
// mapRowToReminder.
export function buildReminderInsertRows(appointment: {
  id: string;
  date: string;
  time: string;
}) {
  return (Object.keys(TIMING_TO_TYPE) as NotificationTiming[]).map((timing) => ({
    appointment_id: appointment.id,
    type: TIMING_TO_TYPE[timing],
    recipient_role: "CLIENTA" as const,
    scheduled_for: computeReminderTime(
      appointment.date,
      appointment.time,
      HOURS_BEFORE[timing]
    ).toISOString(),
    status: "PENDIENTE" as const,
  }));
}

// Igual que isInvalidUuidError en lib/data/appointments-store.ts: el id
// recibido no es un uuid válido, se trata como "sin resultados" en vez
// de romper con un error 500.
function isInvalidUuidError(error: { code?: string } | null): boolean {
  return error?.code === "22P02";
}

// Recordatorios de UNA cita, más recientes primero (para que un
// `.find()` por timing devuelva siempre el vigente aunque haya
// historial de reprogramaciones anteriores). Incluye TODO el historial
// (también los CANCELADA): lo usa
// lib/data/appointments-store.ts para poblar Appointment.reminders,
// que components/agenda/AppointmentDetail.tsx muestra tal cual.
export async function getRemindersByAppointmentIds(
  appointmentIds: string[]
): Promise<Map<string, AppointmentReminder[]>> {
  const byAppointment = new Map<string, AppointmentReminder[]>();
  if (appointmentIds.length === 0) return byAppointment;

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointment_reminders")
    .select(REMINDER_SELECT)
    .in("appointment_id", appointmentIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron obtener los recordatorios: ${error.message}`);
  }

  for (const row of (data ?? []) as unknown as ReminderRow[]) {
    const reminder = mapRowToReminder(row);
    const list = byAppointment.get(reminder.appointmentId) ?? [];
    list.push(reminder);
    byAppointment.set(reminder.appointmentId, list);
  }

  return byAppointment;
}

export async function getRemindersByAppointmentId(
  appointmentId: string
): Promise<AppointmentReminder[]> {
  const byAppointment = await getRemindersByAppointmentIds([appointmentId]);
  return byAppointment.get(appointmentId) ?? [];
}

// Crea las 2 filas (24h/1h, CLIENTA, WHATSAPP) en estado PENDIENTE para
// una cita recién agendada o recién reprogramada. NUNCA borra ni
// modifica recordatorios anteriores: el llamador
// (app/(dashboard)/agenda/actions.ts) decide, antes de llamar a esta
// función, si corresponde cancelarlos primero.
export async function createPendingReminders(appointment: {
  id: string;
  date: string;
  time: string;
}): Promise<AppointmentReminder[]> {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("appointment_reminders")
    .insert(buildReminderInsertRows(appointment))
    .select(REMINDER_SELECT);

  if (error) {
    throw new Error(`No se pudieron crear los recordatorios: ${error.message}`);
  }

  return ((data ?? []) as unknown as ReminderRow[]).map(mapRowToReminder);
}

export interface ReminderStatusPatch {
  status: NotificationStatus;
  channel?: "WHATSAPP";
  providerMessageId?: string;
  sentAt?: Date;
}

// Persiste el resultado de intentar programar/cancelar un recordatorio
// contra Twilio (ver lib/notifications/appointment-notifications.ts):
// status, canal, twilio_message_sid y, si corresponde, sentAt. Nunca
// borra la fila.
export async function updateReminderStatus(
  id: string,
  patch: ReminderStatusPatch
): Promise<AppointmentReminder | undefined> {
  const supabase = await getSupabaseServerClient();

  const dbPatch: Record<string, unknown> = { status: patch.status };
  if (patch.channel !== undefined) dbPatch.channel = patch.channel;
  if (patch.providerMessageId !== undefined) dbPatch.twilio_message_sid = patch.providerMessageId;
  if (patch.sentAt !== undefined) dbPatch.sent_at = patch.sentAt.toISOString();

  const { data, error } = await supabase
    .from("appointment_reminders")
    .update(dbPatch)
    .eq("id", id)
    .select(REMINDER_SELECT)
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) return undefined;
    throw new Error(`No se pudo actualizar el recordatorio: ${error.message}`);
  }

  return data ? mapRowToReminder(data as unknown as ReminderRow) : undefined;
}
