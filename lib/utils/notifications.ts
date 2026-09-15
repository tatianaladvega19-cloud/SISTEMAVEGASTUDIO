// Lógica de preparación de recordatorios de citas (Agenda). Calcula
// cuándo debería dispararse cada recordatorio, pero NO envía nada ni
// asigna el id definitivo: ese id lo asigna Supabase al insertar la
// fila real en appointment_reminders (ver
// lib/data/appointment-reminders-store.ts, que reutiliza
// computeReminderTime de aquí para no duplicar el cálculo).
//
// Arquitectura definitiva de VEGA STUDIO (ver
// supabase/migrations/20260909201050_initial_vega_studio_schema.sql,
// tabla appointment_reminders): la administradora SOLO recibe el aviso
// inmediato al crear la cita (columnas admin_notification_* de
// Appointment); los recordatorios 24h/1h son exclusivos de la CLIENTA.

import type { AppointmentReminder, NotificationTiming } from "../types";
import { parseISODate } from "./agenda";

const REMINDER_HOURS_BEFORE: Record<NotificationTiming, number> = {
  "24H_ANTES": 24,
  "1H_ANTES": 1,
};

const TIMINGS: NotificationTiming[] = ["24H_ANTES", "1H_ANTES"];

export function computeReminderTime(
  date: string,
  time: string,
  hoursBefore: number
): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentAt = parseISODate(date);
  appointmentAt.setHours(hours, minutes, 0, 0);
  appointmentAt.setTime(appointmentAt.getTime() - hoursBefore * 60 * 60 * 1000);
  return appointmentAt;
}

let nextReminderId = 1;

// Genera los 2 recordatorios (24h/1h, CLIENTA) de una cita en estado
// "PENDIENTE", con un id temporal en memoria. Se usa en pruebas y en
// lib/mocks/appointments.ts; la persistencia real en Supabase (id
// definitivo, insert en appointment_reminders) vive en
// lib/data/appointment-reminders-store.ts.
export function buildAppointmentReminders(appointment: {
  id: string;
  date: string;
  time: string;
}): AppointmentReminder[] {
  return TIMINGS.map((timing) => ({
    id: `reminder-${nextReminderId++}`,
    appointmentId: appointment.id,
    timing,
    recipientRole: "CLIENTA" as const,
    status: "PENDIENTE" as const,
    scheduledFor: computeReminderTime(
      appointment.date,
      appointment.time,
      REMINDER_HOURS_BEFORE[timing]
    ),
  }));
}
