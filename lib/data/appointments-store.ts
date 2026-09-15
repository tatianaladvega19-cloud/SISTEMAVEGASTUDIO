// Frontera entre la aplicación y Supabase para el módulo Agenda (citas).
//
// Antes este módulo mantenía las citas en un array en memoria del
// proceso del servidor (mockAppointments + sessionAppointments). Ahora
// consulta directamente public.appointments (ver
// supabase/migrations/20260909201050_initial_vega_studio_schema.sql y
// supabase/migrations/20260915130000_appointments_temp_public_access.sql)
// a través de lib/supabase/server.ts (key publishable/anon, nunca
// service_role), mismo patrón que lib/data/clients-store.ts,
// lib/data/professionals-store.ts y lib/data/services-store.ts.
//
// appointments NO tiene columnas para el nombre histórico de
// cliente/servicio/profesional (a diferencia de sale_items, que sí
// copia service_name/unit_price): clientName/serviceName/
// professionalName se resuelven aquí vía join (select embebido) contra
// clients/professionals/services en cada lectura, no como una copia
// congelada en el momento de agendar.
//
// `Appointment.reminders` SÍ se persiste, pero en una tabla aparte
// (public.appointment_reminders, ver
// lib/data/appointment-reminders-store.ts): se lee con una consulta
// adicional (en lote para getAllAppointments, para no hacer N+1) y se
// adjunta a cada cita mapeada. Nunca se reconstruye en memoria.

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getRemindersByAppointmentId,
  getRemindersByAppointmentIds,
} from "@/lib/data/appointment-reminders-store";
import type { Appointment, AppointmentReminder } from "@/lib/types";

// Se lanza cuando el EXCLUDE constraint
// appointments_no_overlap_per_professional (migración inicial) rechaza
// un insert/update porque la profesional ya tiene una cita activa que
// se solapa con el horario solicitado. Los Server Actions de
// app/(dashboard)/agenda/actions.ts la capturan para devolver el mismo
// mensaje de conflicto que ya muestra la UI, en vez de dejar pasar un
// error 500.
export class AppointmentConflictError extends Error {}

const APPOINTMENT_SELECT = `
  id,
  client_id,
  professional_id,
  service_id,
  date,
  start_time,
  duration,
  status,
  notes,
  confirmation_message_id,
  confirmation_status,
  confirmation_error,
  admin_notification_message_id,
  admin_notification_status,
  admin_notification_error,
  created_at,
  updated_at,
  clients ( full_name ),
  professionals ( name ),
  services ( name )
`;

interface EmbeddedName {
  full_name?: string;
  name?: string;
}

type Embedded<T extends EmbeddedName> = T | T[] | null;

interface AppointmentRow {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  date: string;
  start_time: string;
  duration: number;
  status: Appointment["status"];
  notes: string | null;
  confirmation_message_id: string | null;
  confirmation_status: Appointment["confirmationStatus"] | null;
  confirmation_error: string | null;
  admin_notification_message_id: string | null;
  admin_notification_status: Appointment["adminNotificationStatus"] | null;
  admin_notification_error: string | null;
  created_at: string;
  updated_at: string;
  clients: Embedded<{ full_name: string }>;
  professionals: Embedded<{ name: string }>;
  services: Embedded<{ name: string }>;
}

// El embebido de una relación many-to-one (client_id -> clients.id,
// etc.) llega como objeto único, pero supabase-js lo tipa como
// array|objeto según la versión/consulta; se maneja cualquiera de las
// dos formas para no depender de ese detalle.
function extractEmbeddedField<T extends EmbeddedName>(
  value: Embedded<T>,
  field: keyof T
): string {
  if (!value) return "";
  const record = Array.isArray(value) ? value[0] : value;
  return (record?.[field] as string | undefined) ?? "";
}

function mapRowToAppointment(
  row: AppointmentRow,
  reminders: AppointmentReminder[]
): Appointment {
  // Postgres "time" llega como "HH:MM:SS"; AGENDA_HOURS/el resto de
  // Agenda trabaja con "HH:mm".
  const time = row.start_time.slice(0, 5);

  return {
    id: row.id,
    clientId: row.client_id,
    clientName: extractEmbeddedField(row.clients, "full_name"),
    serviceId: row.service_id,
    serviceName: extractEmbeddedField(row.services, "name"),
    professionalId: row.professional_id,
    professionalName: extractEmbeddedField(row.professionals, "name"),
    date: row.date,
    time,
    duration: row.duration,
    status: row.status,
    notes: row.notes ?? undefined,
    reminders,
    confirmationMessageId: row.confirmation_message_id ?? undefined,
    confirmationStatus: row.confirmation_status ?? undefined,
    confirmationError: row.confirmation_error ?? undefined,
    adminNotificationMessageId: row.admin_notification_message_id ?? undefined,
    adminNotificationStatus: row.admin_notification_status ?? undefined,
    adminNotificationError: row.admin_notification_error ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Es "invalid_text_representation": el id recibido no es un uuid
// válido. Se trata igual que "no encontrado" en vez de romper la
// página con un error 500 (mismo criterio que los demás stores).
function isInvalidUuidError(error: { code?: string } | null): boolean {
  return error?.code === "22P02";
}

// "23P01" = exclusion_violation: el EXCLUDE constraint
// appointments_no_overlap_per_professional rechazó el insert/update.
function isScheduleConflictError(error: { code?: string } | null): boolean {
  return error?.code === "23P01";
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron obtener las citas: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as AppointmentRow[];
  const remindersByAppointment = await getRemindersByAppointmentIds(
    rows.map((row) => row.id)
  );

  return rows.map((row) =>
    mapRowToAppointment(row, remindersByAppointment.get(row.id) ?? [])
  );
}

export async function getAppointmentById(
  id: string
): Promise<Appointment | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) return undefined;
    throw new Error(`No se pudo obtener la cita: ${error.message}`);
  }

  if (!data) return undefined;

  const reminders = await getRemindersByAppointmentId(id);
  return mapRowToAppointment(data as unknown as AppointmentRow, reminders);
}

export interface NewAppointmentInput {
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export async function createAppointment(
  input: NewAppointmentInput
): Promise<Appointment> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      client_id: input.clientId,
      professional_id: input.professionalId,
      service_id: input.serviceId,
      date: input.date,
      start_time: input.time,
      duration: input.duration,
      notes: input.notes?.trim() || null,
    })
    .select(APPOINTMENT_SELECT)
    .single();

  if (error) {
    if (isScheduleConflictError(error)) {
      throw new AppointmentConflictError(
        "La profesional seleccionada ya tiene una cita en ese horario."
      );
    }
    throw new Error(`No se pudo crear la cita: ${error.message}`);
  }

  // Recién creada: todavía no existen filas en appointment_reminders
  // (las crea explícitamente app/(dashboard)/agenda/actions.ts vía
  // createPendingReminders, DESPUÉS del insert).
  return mapRowToAppointment(data as unknown as AppointmentRow, []);
}

// Actualiza (reprograma / cambia estado / cancela) la cita `id` y
// devuelve la copia actualizada. `patch` puede traer cualquier
// subconjunto de las columnas reales de appointments, incluidas las de
// seguimiento de Twilio que arma
// lib/notifications/appointment-notifications.ts (confirmationStatus,
// adminNotificationStatus, etc.). `reminders` NO es una columna de
// appointments (vive en appointment_reminders, ver
// lib/data/appointment-reminders-store.ts) y se ignora si viniera en
// `patch`: siempre se relee el estado real y vigente de los
// recordatorios desde esa tabla para la respuesta.
export async function updateAppointment(
  id: string,
  patch: Partial<Appointment>
): Promise<Appointment | undefined> {
  const supabase = await createSupabaseServerClient();

  const dbPatch: Record<string, unknown> = {};
  if (patch.clientId !== undefined) dbPatch.client_id = patch.clientId;
  if (patch.serviceId !== undefined) dbPatch.service_id = patch.serviceId;
  if (patch.professionalId !== undefined) dbPatch.professional_id = patch.professionalId;
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.time !== undefined) dbPatch.start_time = patch.time;
  if (patch.duration !== undefined) dbPatch.duration = patch.duration;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes?.trim() || null;
  if (patch.confirmationMessageId !== undefined)
    dbPatch.confirmation_message_id = patch.confirmationMessageId;
  if (patch.confirmationStatus !== undefined)
    dbPatch.confirmation_status = patch.confirmationStatus;
  if (patch.confirmationError !== undefined)
    dbPatch.confirmation_error = patch.confirmationError;
  if (patch.adminNotificationMessageId !== undefined)
    dbPatch.admin_notification_message_id = patch.adminNotificationMessageId;
  if (patch.adminNotificationStatus !== undefined)
    dbPatch.admin_notification_status = patch.adminNotificationStatus;
  if (patch.adminNotificationError !== undefined)
    dbPatch.admin_notification_error = patch.adminNotificationError;

  const result =
    Object.keys(dbPatch).length > 0
      ? await supabase
          .from("appointments")
          .update(dbPatch)
          .eq("id", id)
          .select(APPOINTMENT_SELECT)
          .maybeSingle()
      : await supabase
          .from("appointments")
          .select(APPOINTMENT_SELECT)
          .eq("id", id)
          .maybeSingle();

  const { data, error } = result;

  if (error) {
    if (isInvalidUuidError(error)) return undefined;
    if (isScheduleConflictError(error)) {
      throw new AppointmentConflictError(
        "La profesional seleccionada ya tiene una cita en ese horario."
      );
    }
    throw new Error(`No se pudo actualizar la cita: ${error.message}`);
  }

  if (!data) return undefined;

  const reminders = await getRemindersByAppointmentId(id);
  return mapRowToAppointment(data as unknown as AppointmentRow, reminders);
}
