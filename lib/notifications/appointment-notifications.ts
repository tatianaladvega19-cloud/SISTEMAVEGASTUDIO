// Orquestación de notificaciones de una cita (Agenda -> Twilio +
// alertas internas).
//
// Estas funciones son deliberadamente "puras" respecto al
// almacenamiento: reciben la cita, la clienta y los recordatorios que
// corresponden a la operación (ya leídos/creados en Supabase por el
// llamador, ver lib/data/appointment-reminders-store.ts), y devuelven
// qué hay que persistir: `appointmentPatch` (columnas de la fila
// `appointments`: confirmation_*/admin_notification_*, NUNCA
// `reminders` — esa tabla no tiene esa columna), `reminders`
// (recordatorios con su status/canal/SID final, uno por fila real de
// appointment_reminders que el llamador debe actualizar) y `alerts`
// (para lib/data/alerts-store.ts). Nunca importan lib/data/*-store.ts
// directamente: quien las llama (los Server Actions de
// app/(dashboard)/agenda/actions.ts) es responsable de leer los
// recordatorios existentes, crear los nuevos y persistir el resultado.
// Esto las mantiene fáciles de probar sin depender de Supabase (ver
// __tests__/).

import type {
  Appointment,
  AppointmentReminder,
  Client,
  NewAlertInput,
} from "../types";
import { formatAgendaDate } from "../utils/agenda";
import {
  cancelScheduledMessage,
  scheduleClientReminder24h,
  scheduleClientReminder1h,
  sendAdminAppointmentNotification,
  sendClientAppointmentConfirmation,
} from "./twilio";

export interface NotifyResult {
  /** Columnas a persistir en la fila de `appointments` (confirmation_* / admin_notification_*). */
  appointmentPatch: Partial<Appointment>;
  /** Recordatorios cuyo status/canal/SID hay que persistir en `appointment_reminders`. */
  reminders: AppointmentReminder[];
  alerts: NewAlertInput[];
}

function whatsappSentAlert(
  label: string,
  appointment: Pick<Appointment, "id" | "clientId" | "clientName">
): NewAlertInput {
  return {
    type: "WHATSAPP_SENT",
    title: "WhatsApp enviado",
    message: `Se envió el WhatsApp de ${label} para la cita de ${appointment.clientName}.`,
    appointmentId: appointment.id,
    clientId: appointment.clientId,
    priority: "LOW",
  };
}

function whatsappFailedAlert(
  label: string,
  appointment: Pick<Appointment, "id" | "clientId" | "clientName">,
  reason?: string
): NewAlertInput {
  return {
    type: "WHATSAPP_FAILED",
    title: "WhatsApp no enviado",
    message: `No se pudo enviar el WhatsApp de ${label} para la cita de ${appointment.clientName}.${
      reason ? ` Motivo: ${reason}` : ""
    }`,
    appointmentId: appointment.id,
    clientId: appointment.clientId,
    priority: "HIGH",
  };
}

// Programa (o intenta programar) los recordatorios recibidos: siempre
// de la CLIENTA (la administradora nunca tiene filas en
// appointment_reminders, solo el aviso inmediato de
// sendAdminAppointmentNotification). Idempotencia (PASO 17): un
// recordatorio ya programado/enviado no se vuelve a intentar.
async function scheduleClientReminders(
  appointment: Appointment,
  client: Pick<Client, "phone">,
  reminders: AppointmentReminder[]
): Promise<AppointmentReminder[]> {
  const updated: AppointmentReminder[] = [];

  for (const reminder of reminders) {
    if (
      reminder.recipientRole !== "CLIENTA" ||
      reminder.status === "PROGRAMADA" ||
      reminder.status === "ENVIADA"
    ) {
      updated.push(reminder);
      continue;
    }

    const scheduleFn =
      reminder.timing === "24H_ANTES"
        ? scheduleClientReminder24h
        : scheduleClientReminder1h;

    const result = await scheduleFn(appointment, client, reminder.scheduledFor);

    updated.push(
      result.success
        ? {
            ...reminder,
            status: "PROGRAMADA",
            channel: "WHATSAPP",
            providerMessageId: result.sid,
          }
        : { ...reminder, status: "PENDIENTE", channel: "WHATSAPP" }
    );
  }

  return updated;
}

// Cierra en CANCELADA todo recordatorio de clienta que deja de ser
// válido por una reprogramación o cancelación: los PENDIENTE (nunca
// llegaron a programarse en Twilio, típicamente porque no está
// configurado) y los PROGRAMADA (con SID: se intenta cancelar en
// Twilio primero, sin SID: no hay nada que cancelar ahí). El resultado
// de Twilio no cambia el status final — igual que el resto de este
// archivo (PASO 18), un fallo de Twilio nunca deja el recordatorio
// abierto. ENVIADA/FALLIDA/CANCELADA quedan tal cual: son estados
// finales, no hay nada que cancelar.
async function cancelClientReminders(
  reminders: AppointmentReminder[]
): Promise<AppointmentReminder[]> {
  const updated: AppointmentReminder[] = [];

  for (const reminder of reminders) {
    if (reminder.recipientRole !== "CLIENTA") {
      updated.push(reminder);
      continue;
    }

    if (reminder.status === "PENDIENTE" || reminder.status === "PROGRAMADA") {
      if (reminder.providerMessageId) {
        await cancelScheduledMessage(reminder.providerMessageId).catch(() => undefined);
      }
      updated.push({ ...reminder, status: "CANCELADA" });
    } else {
      updated.push(reminder);
    }
  }

  return updated;
}

// Cita recién creada (PASO 1-11): confirmación a la clienta, aviso a
// la administradora y programación de los 2 recordatorios (24h/1h,
// CLIENTA) que el llamador ya insertó en Supabase como PENDIENTE
// (`pendingReminders`, ver
// lib/data/appointment-reminders-store.ts#createPendingReminders).
export async function notifyAppointmentCreated(
  appointment: Appointment,
  client: Client,
  pendingReminders: AppointmentReminder[]
): Promise<NotifyResult> {
  const alerts: NewAlertInput[] = [
    {
      type: "APPOINTMENT_CREATED",
      title: "Nueva cita",
      message: `${appointment.clientName} tiene cita el ${formatAgendaDate(
        appointment.date
      )}, ${appointment.time}.`,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      priority: "NORMAL",
    },
  ];

  const patch: Partial<Appointment> = {};

  // Idempotencia (PASO 17): si ya tiene confirmationMessageId, no se
  // reenvía (relevante si esta función llegara a invocarse dos veces
  // para la misma cita).
  if (!appointment.confirmationMessageId) {
    const result = await sendClientAppointmentConfirmation(appointment, client);
    patch.confirmationStatus = result.success ? "ENVIADA" : "FALLIDA";
    if (result.success) {
      patch.confirmationMessageId = result.sid;
    } else {
      patch.confirmationError = result.error;
    }
    alerts.push(
      result.success
        ? whatsappSentAlert("confirmación a la clienta", appointment)
        : whatsappFailedAlert("confirmación a la clienta", appointment, result.error)
    );
  }

  if (!appointment.adminNotificationMessageId) {
    const result = await sendAdminAppointmentNotification(appointment);
    patch.adminNotificationStatus = result.success ? "ENVIADA" : "FALLIDA";
    if (result.success) {
      patch.adminNotificationMessageId = result.sid;
    } else {
      patch.adminNotificationError = result.error;
    }
    alerts.push(
      result.success
        ? whatsappSentAlert("notificación a la administradora", appointment)
        : whatsappFailedAlert(
            "notificación a la administradora",
            appointment,
            result.error
          )
    );
  }

  const reminders = await scheduleClientReminders(appointment, client, pendingReminders);

  return { appointmentPatch: patch, reminders, alerts };
}

// Cita reprogramada (PASO 12): cancela los recordatorios anteriores
// todavía activos (`previousReminders`, ya sin los CANCELADA de un
// historial más viejo — eso lo filtra el llamador) y programa los
// nuevos que el llamador ya insertó para la nueva fecha/hora
// (`pendingReminders`). Devuelve AMBOS grupos en `reminders` para que
// el llamador persista el status final de cada fila; ninguna se borra,
// así que el historial completo queda en appointment_reminders.
export async function notifyAppointmentRescheduled(
  appointment: Appointment,
  client: Client,
  previousReminders: AppointmentReminder[],
  pendingReminders: AppointmentReminder[]
): Promise<NotifyResult> {
  const cancelled = await cancelClientReminders(previousReminders);
  const scheduled = await scheduleClientReminders(appointment, client, pendingReminders);

  const alerts: NewAlertInput[] = [
    {
      type: "APPOINTMENT_RESCHEDULED",
      title: "Cita reprogramada",
      message: `${appointment.clientName} cambió su cita al ${formatAgendaDate(
        appointment.date
      )}, ${appointment.time}.`,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      priority: "NORMAL",
    },
  ];

  return {
    appointmentPatch: {},
    reminders: [...cancelled, ...scheduled],
    alerts,
  };
}

// Cita cancelada (PASO 13): cancela los recordatorios todavía activos
// (`activeReminders`, ya filtrados por el llamador) y deja constancia
// interna, sin borrar el historial.
export async function notifyAppointmentCancelled(
  appointment: Appointment,
  activeReminders: AppointmentReminder[]
): Promise<NotifyResult> {
  const reminders = await cancelClientReminders(activeReminders);

  const alerts: NewAlertInput[] = [
    {
      type: "APPOINTMENT_CANCELLED",
      title: "Cita cancelada",
      message: `${appointment.clientName} canceló su cita del ${formatAgendaDate(
        appointment.date
      )}, ${appointment.time}.`,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      priority: "HIGH",
    },
  ];

  return { appointmentPatch: {}, reminders, alerts };
}
