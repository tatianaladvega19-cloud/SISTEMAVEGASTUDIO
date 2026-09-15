"use server";

// Server Actions de Agenda: crear/editar/cancelar cita. Mismo patrón
// que app/(dashboard)/ventas/nueva/actions.ts: se vuelve a validar en
// el servidor y se recalculan nombre/precio (aquí: nombre de cliente,
// servicio y profesional) desde las fuentes de verdad en vez de
// confiar en lo que mande el cliente, porque esta acción es alcanzable
// por POST directo.
//
// Además de guardar la cita, dispara el sistema de notificaciones
// (WhatsApp a la clienta, WhatsApp a la administradora, recordatorios
// 24h/1h y alertas internas). Si Twilio falla o no está configurado,
// la cita igual queda guardada (PASO 18): el error solo se refleja
// como una alerta interna "WhatsApp no enviado".
//
// Este archivo es quien conecta lib/notifications/appointment-notifications.ts
// (orquestación pura: decide qué enviar/cancelar y qué status queda)
// con la persistencia real: lib/data/appointment-reminders-store.ts
// (crear los 2 recordatorios pendientes / actualizar su status y SID)
// y lib/data/alerts-store.ts (crear las alertas internas). Ninguno de
// esos dos módulos se importa entre sí.

import { revalidatePath } from "next/cache";
import {
  AppointmentConflictError,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
} from "@/lib/data/appointments-store";
import {
  createPendingReminders,
  updateReminderStatus,
} from "@/lib/data/appointment-reminders-store";
import { createAlert } from "@/lib/data/alerts-store";
import { getClientById } from "@/lib/data/clients-store";
import { getProfessionalById } from "@/lib/data/professionals-store";
import { getServiceById } from "@/lib/data/services-store";
import { hasScheduleConflict } from "@/lib/utils/agenda";
import { validateAppointmentFields } from "@/lib/validations/appointment";
import {
  notifyAppointmentCancelled,
  notifyAppointmentCreated,
  notifyAppointmentRescheduled,
} from "@/lib/notifications/appointment-notifications";
import type { Appointment, AppointmentReminder, AppointmentStatus } from "@/lib/types";

export interface AppointmentActionResult {
  success: boolean;
  error?: string;
  appointment?: Appointment;
}

interface AppointmentInputBase {
  clientId: string | null;
  serviceId: string | null;
  professionalId: string | null;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export type CreateAppointmentActionInput = AppointmentInputBase;

export interface UpdateAppointmentActionInput extends AppointmentInputBase {
  status: AppointmentStatus;
}

// Recalcula y valida cliente/servicio/profesional desde el servidor.
// Devuelve un error listo para mostrar, o los registros ya resueltos.
async function resolveAppointmentEntities(input: AppointmentInputBase) {
  const errors = validateAppointmentFields({
    clientId: input.clientId,
    serviceId: input.serviceId,
    professionalId: input.professionalId,
    duration: input.duration,
  });
  const firstError = errors.client ?? errors.service ?? errors.professional ?? errors.duration;
  if (firstError) return { error: firstError } as const;

  const client = await getClientById(input.clientId as string);
  if (!client) return { error: "El cliente seleccionado ya no existe." } as const;

  const service = await getServiceById(input.serviceId as string);
  if (!service || !service.isActive) {
    return { error: "El servicio seleccionado ya no está disponible." } as const;
  }

  const professional = await getProfessionalById(input.professionalId as string);
  if (!professional || !professional.isActive) {
    return { error: "La profesional seleccionada ya no está disponible." } as const;
  }

  return { client, service, professional } as const;
}

// Persiste en appointment_reminders el status/canal/SID final que
// calculó appointment-notifications.ts (ver NotifyResult.reminders).
async function persistReminders(reminders: AppointmentReminder[]): Promise<void> {
  await Promise.all(
    reminders.map((reminder) =>
      updateReminderStatus(reminder.id, {
        status: reminder.status,
        channel: reminder.channel,
        providerMessageId: reminder.providerMessageId,
      })
    )
  );
}

export async function createAppointmentAction(
  input: CreateAppointmentActionInput
): Promise<AppointmentActionResult> {
  const resolved = await resolveAppointmentEntities(input);
  if ("error" in resolved) return { success: false, error: resolved.error };
  const { client, service, professional } = resolved;

  const conflictError = `${professional.name} ya tiene una cita en ese horario. Elige otro horario disponible.`;

  if (
    hasScheduleConflict(
      await getAllAppointments(),
      professional.id,
      input.date,
      input.time,
      input.duration
    )
  ) {
    return { success: false, error: conflictError };
  }

  let appointment: Appointment;
  try {
    appointment = await createAppointment({
      clientId: client.id,
      clientName: client.fullName,
      serviceId: service.id,
      serviceName: service.name,
      professionalId: professional.id,
      professionalName: professional.name,
      date: input.date,
      time: input.time,
      duration: input.duration,
      notes: input.notes,
    });
  } catch (error) {
    // El EXCLUDE constraint appointments_no_overlap_per_professional
    // rechazó el insert (carrera con otra solicitud entre el chequeo de
    // arriba y el insert): mismo mensaje que el chequeo previo, no un
    // error 500.
    if (error instanceof AppointmentConflictError) {
      return { success: false, error: conflictError };
    }
    throw error;
  }

  let pendingReminders: AppointmentReminder[] = [];
  try {
    pendingReminders = await createPendingReminders({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time,
    });
  } catch {
    await createAlert({
      type: "WHATSAPP_FAILED",
      title: "Recordatorios no creados",
      message: `No se pudieron crear los recordatorios de la cita de ${appointment.clientName}.`,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      priority: "HIGH",
    });
  }

  try {
    const result = await notifyAppointmentCreated(appointment, client, pendingReminders);
    await updateAppointment(appointment.id, result.appointmentPatch);
    await persistReminders(result.reminders);
    for (const alert of result.alerts) await createAlert(alert);
  } catch {
    await createAlert({
      type: "WHATSAPP_FAILED",
      title: "WhatsApp no enviado",
      message: `No se pudieron enviar las notificaciones de la cita de ${appointment.clientName}.`,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      priority: "HIGH",
    });
  }

  appointment = (await getAppointmentById(appointment.id)) ?? appointment;

  revalidatePath("/agenda");
  return { success: true, appointment };
}

export async function updateAppointmentAction(
  id: string,
  input: UpdateAppointmentActionInput
): Promise<AppointmentActionResult> {
  const existing = await getAppointmentById(id);
  if (!existing) return { success: false, error: "La cita ya no existe." };
  if (existing.status === "CANCELADA") {
    return { success: false, error: "No se puede editar una cita cancelada." };
  }

  const resolved = await resolveAppointmentEntities(input);
  if ("error" in resolved) return { success: false, error: resolved.error };
  const { client, service, professional } = resolved;

  const conflictError = `${professional.name} ya tiene una cita en ese horario. Elige otro horario disponible.`;

  if (
    hasScheduleConflict(
      await getAllAppointments(),
      professional.id,
      input.date,
      input.time,
      input.duration,
      id
    )
  ) {
    return { success: false, error: conflictError };
  }

  const wasRescheduled =
    existing.date !== input.date ||
    existing.time !== input.time ||
    existing.duration !== input.duration;

  let appointment: Appointment;
  try {
    appointment =
      (await updateAppointment(id, {
        clientId: client.id,
        clientName: client.fullName,
        serviceId: service.id,
        serviceName: service.name,
        professionalId: professional.id,
        professionalName: professional.name,
        date: input.date,
        time: input.time,
        duration: input.duration,
        notes: input.notes,
        status: input.status,
      })) ?? existing;
  } catch (error) {
    // Misma carrera que en createAppointmentAction: el EXCLUDE
    // constraint rechazó el update.
    if (error instanceof AppointmentConflictError) {
      return { success: false, error: conflictError };
    }
    throw error;
  }

  if (wasRescheduled) {
    // Recordatorios de la cita ANTERIOR todavía vigentes (sin contar
    // los ya CANCELADA de reprogramaciones más viejas): son los que
    // hay que cancelar en Twilio antes de programar los nuevos.
    const previousReminders = appointment.reminders.filter(
      (reminder) => reminder.status !== "CANCELADA"
    );

    let pendingReminders: AppointmentReminder[] = [];
    try {
      pendingReminders = await createPendingReminders({
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
      });
    } catch {
      await createAlert({
        type: "WHATSAPP_FAILED",
        title: "Recordatorios no creados",
        message: `No se pudieron crear los nuevos recordatorios de la cita de ${appointment.clientName}.`,
        appointmentId: id,
        clientId: appointment.clientId,
        priority: "HIGH",
      });
    }

    try {
      const result = await notifyAppointmentRescheduled(
        appointment,
        client,
        previousReminders,
        pendingReminders
      );
      await persistReminders(result.reminders);
      for (const alert of result.alerts) await createAlert(alert);
    } catch {
      await createAlert({
        type: "WHATSAPP_FAILED",
        title: "WhatsApp no enviado",
        message: `No se pudo notificar la reprogramación de la cita de ${appointment.clientName}.`,
        appointmentId: id,
        clientId: appointment.clientId,
        priority: "HIGH",
      });
    }

    appointment = (await getAppointmentById(id)) ?? appointment;
  }

  revalidatePath("/agenda");
  return { success: true, appointment };
}

export async function cancelAppointmentAction(
  id: string
): Promise<AppointmentActionResult> {
  const existing = await getAppointmentById(id);
  if (!existing) return { success: false, error: "La cita ya no existe." };
  if (existing.status === "CANCELADA") {
    return { success: true, appointment: existing };
  }

  let appointment = (await updateAppointment(id, { status: "CANCELADA" })) ?? existing;

  try {
    const activeReminders = appointment.reminders.filter(
      (reminder) => reminder.status !== "CANCELADA"
    );
    const result = await notifyAppointmentCancelled(appointment, activeReminders);
    await persistReminders(result.reminders);
    for (const alert of result.alerts) await createAlert(alert);
  } catch {
    await createAlert({
      type: "WHATSAPP_FAILED",
      title: "WhatsApp no enviado",
      message: `No se pudo notificar la cancelación de la cita de ${appointment.clientName}.`,
      appointmentId: id,
      clientId: appointment.clientId,
      priority: "HIGH",
    });
  }

  appointment = (await getAppointmentById(id)) ?? appointment;

  revalidatePath("/agenda");
  return { success: true, appointment };
}
