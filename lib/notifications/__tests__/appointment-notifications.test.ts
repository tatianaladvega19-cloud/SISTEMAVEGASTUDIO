// Pruebas del orquestador de notificaciones de citas (PASO 1-13, 17,
// 18, 22). Se ejecutan sin credenciales reales de Twilio: como no hay
// variables de entorno configuradas, cada intento de envío/programación
// degrada a "Twilio no está configurado", lo que permite verificar que
// la cita y la Agenda nunca se rompen y que las alertas internas se
// generan igual (PASO 18).
//
// Los recordatorios ya NO se leen de `appointment.reminders` (esa
// reconstrucción en memoria se eliminó, ver
// lib/data/appointment-reminders-store.ts): cada prueba arma
// explícitamente los recordatorios "ya persistidos" que recibiría la
// función, tal como lo haría app/(dashboard)/agenda/actions.ts.

import test from "node:test";
import assert from "node:assert/strict";
import {
  notifyAppointmentCancelled,
  notifyAppointmentCreated,
  notifyAppointmentRescheduled,
} from "../appointment-notifications";
import { buildAppointmentReminders } from "../../utils/notifications";
import type { Appointment, Client } from "../../types";

for (const key of [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_MESSAGING_SERVICE_SID",
  "TWILIO_WHATSAPP_CONTENT_SID",
  "TWILIO_ADMIN_WHATSAPP_NUMBER",
]) {
  delete process.env[key];
}

const fakeClient: Client = {
  id: "client-test-1",
  fullName: "Michelle Andrade",
  cedula: "1102345678",
  phone: "0987654321",
  source: "INSTAGRAM",
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "user-vendedor-1",
};

function buildFakeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  const now = new Date();
  // Suficientemente lejos en el futuro para que 24h/1h antes sigan
  // cayendo dentro de la ventana de programación de Twilio.
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const date = inThreeDays.toISOString().slice(0, 10);

  const base: Appointment = {
    id: "appt-test-1",
    clientId: fakeClient.id,
    clientName: fakeClient.fullName,
    serviceId: "svc-test",
    serviceName: "Lifting de pestañas",
    professionalId: "prof-test",
    professionalName: "Camila",
    date,
    time: "10:00",
    duration: 60,
    status: "PROGRAMADA",
    reminders: [],
    createdAt: now,
    updatedAt: now,
  };

  return { ...base, ...overrides };
}

test("notifyAppointmentCreated: sin Twilio configurado, guarda alertas y no rompe (PASO 18)", async () => {
  const appointment = buildFakeAppointment();
  const pendingReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const result = await notifyAppointmentCreated(appointment, fakeClient, pendingReminders);

  assert.equal(result.appointmentPatch.confirmationStatus, "FALLIDA");
  assert.equal(result.appointmentPatch.adminNotificationStatus, "FALLIDA");
  assert.equal(result.appointmentPatch.reminders, undefined);

  const types = result.alerts.map((alert) => alert.type);
  assert.ok(types.includes("APPOINTMENT_CREATED"));
  assert.equal(types.filter((type) => type === "WHATSAPP_FAILED").length, 2);

  // Los 2 recordatorios de clienta se intentaron pero quedan
  // PENDIENTE (no FALLIDA "permanente") porque Twilio no está
  // configurado, no porque el horario sea inválido.
  assert.equal(result.reminders.length, 2);
  for (const reminder of result.reminders) {
    assert.equal(reminder.recipientRole, "CLIENTA");
    assert.equal(reminder.status, "PENDIENTE");
  }
});

test("notifyAppointmentCreated: idempotencia — no reenvía si ya tiene confirmationMessageId/adminNotificationMessageId (PASO 17)", async () => {
  const appointment = buildFakeAppointment({
    confirmationMessageId: "SM-ya-enviado-clienta",
    adminNotificationMessageId: "SM-ya-enviado-admin",
  });
  const pendingReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const result = await notifyAppointmentCreated(appointment, fakeClient, pendingReminders);

  assert.equal(result.appointmentPatch.confirmationStatus, undefined);
  assert.equal(result.appointmentPatch.adminNotificationStatus, undefined);

  const types = result.alerts.map((alert) => alert.type);
  assert.deepEqual(types, ["APPOINTMENT_CREATED"]);
});

test("notifyAppointmentCancelled: cancela recordatorios activos y los marca CANCELADA", async () => {
  const appointment = buildFakeAppointment();
  const activeReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  }).map((reminder) => ({
    ...reminder,
    status: "PROGRAMADA" as const,
    providerMessageId: `SM-${reminder.id}`,
  }));

  const result = await notifyAppointmentCancelled(appointment, activeReminders);

  assert.equal(result.reminders.length, 2);
  for (const reminder of result.reminders) {
    assert.equal(reminder.status, "CANCELADA");
  }

  assert.equal(result.alerts.length, 1);
  assert.equal(result.alerts[0].type, "APPOINTMENT_CANCELLED");
});

test("notifyAppointmentCancelled: sin recordatorios activos, no rompe y solo crea la alerta", async () => {
  const appointment = buildFakeAppointment();

  const result = await notifyAppointmentCancelled(appointment, []);

  assert.deepEqual(result.reminders, []);
  assert.equal(result.alerts.length, 1);
  assert.equal(result.alerts[0].type, "APPOINTMENT_CANCELLED");
});

test("notifyAppointmentCancelled: recordatorios PENDIENTE (Twilio nunca llegó a programarlos) también se cierran CANCELADA", async () => {
  const appointment = buildFakeAppointment();
  // Igual que quedan tras notifyAppointmentCreated sin Twilio
  // configurado: PENDIENTE, sin SID.
  const activeReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const result = await notifyAppointmentCancelled(appointment, activeReminders);

  assert.equal(result.reminders.length, 2);
  for (const reminder of result.reminders) {
    assert.equal(reminder.status, "CANCELADA");
  }
});

test("notifyAppointmentRescheduled: cancela los anteriores y programa los nuevos, preservando ambos para el historial", async () => {
  const appointment = buildFakeAppointment();
  const previousReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  }).map((reminder) => ({
    ...reminder,
    status: "PROGRAMADA" as const,
    providerMessageId: `SM-${reminder.id}`,
  }));

  // Simula que la cita ya se movió a una nueva fecha/hora antes de
  // llamar al orquestador (así lo hace app/(dashboard)/agenda/actions.ts).
  const now = new Date();
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  appointment.date = inFiveDays.toISOString().slice(0, 10);
  appointment.time = "15:00";
  const pendingReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const result = await notifyAppointmentRescheduled(
    appointment,
    fakeClient,
    previousReminders,
    pendingReminders
  );

  assert.equal(result.reminders.length, 4);
  const cancelled = result.reminders.filter((reminder) => reminder.status === "CANCELADA");
  const scheduled = result.reminders.filter((reminder) => reminder.status !== "CANCELADA");
  assert.equal(cancelled.length, 2);
  assert.equal(scheduled.length, 2);
  assert.ok(scheduled.every((reminder) => reminder.scheduledFor instanceof Date));

  assert.equal(result.alerts.length, 1);
  assert.equal(result.alerts[0].type, "APPOINTMENT_RESCHEDULED");
});

test("notifyAppointmentRescheduled: recordatorios anteriores PENDIENTE (Twilio nunca los programó) quedan CANCELADA y los nuevos PENDIENTE", async () => {
  const appointment = buildFakeAppointment();
  // Igual que quedan tras notifyAppointmentCreated sin Twilio
  // configurado: nunca llegaron a PROGRAMADA, no tienen SID. Este es
  // el caso que reproducía el bug: quedaban PENDIENTE para siempre.
  const previousReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const now = new Date();
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  appointment.date = inFiveDays.toISOString().slice(0, 10);
  appointment.time = "15:00";
  const pendingReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const result = await notifyAppointmentRescheduled(
    appointment,
    fakeClient,
    previousReminders,
    pendingReminders
  );

  assert.equal(result.reminders.length, 4);

  const previousIds = new Set(previousReminders.map((reminder) => reminder.id));
  const oldOnes = result.reminders.filter((reminder) => previousIds.has(reminder.id));
  const newOnes = result.reminders.filter((reminder) => !previousIds.has(reminder.id));

  assert.equal(oldOnes.length, 2);
  for (const reminder of oldOnes) {
    assert.equal(reminder.status, "CANCELADA");
  }

  assert.equal(newOnes.length, 2);
  for (const reminder of newOnes) {
    // Sin Twilio configurado, la programación degrada a PENDIENTE
    // (PASO 18): sigue siendo un estado "activo", nunca CANCELADA.
    assert.equal(reminder.status, "PENDIENTE");
  }
});

test("notifyAppointmentRescheduled: recordatorio anterior PROGRAMADA sin SID queda CANCELADA (no hay nada que cancelar en Twilio)", async () => {
  const appointment = buildFakeAppointment();
  const previousReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  }).map((reminder) => ({ ...reminder, status: "PROGRAMADA" as const }));

  const now = new Date();
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  appointment.date = inFiveDays.toISOString().slice(0, 10);
  appointment.time = "15:00";
  const pendingReminders = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const result = await notifyAppointmentRescheduled(
    appointment,
    fakeClient,
    previousReminders,
    pendingReminders
  );

  const previousIds = new Set(previousReminders.map((reminder) => reminder.id));
  const oldOnes = result.reminders.filter((reminder) => previousIds.has(reminder.id));

  assert.equal(oldOnes.length, 2);
  for (const reminder of oldOnes) {
    assert.equal(reminder.status, "CANCELADA");
  }
});

test("notifyAppointmentRescheduled: reprogramar dos veces no deja ninguna generación anterior PENDIENTE/PROGRAMADA (solo la última queda activa)", async () => {
  const appointment = buildFakeAppointment();

  // Generación 1: recién creada, PENDIENTE (sin Twilio configurado).
  const gen1 = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  // Reprograma #1: gen1 -> CANCELADA, se crea gen2 (PENDIENTE).
  const now = new Date();
  appointment.date = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  appointment.time = "15:00";
  const gen2Pending = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const firstReschedule = await notifyAppointmentRescheduled(
    appointment,
    fakeClient,
    gen1,
    gen2Pending
  );

  // Como haría app/(dashboard)/agenda/actions.ts: todo el historial
  // persistido hasta ahora es firstReschedule.reminders (4 filas). Los
  // "activos" para la próxima reprogramación son los que no quedaron
  // CANCELADA (la gen2 recién creada).
  const historyAfterFirst = firstReschedule.reminders;
  const activeAfterFirst = historyAfterFirst.filter(
    (reminder) => reminder.status !== "CANCELADA"
  );
  assert.equal(activeAfterFirst.length, 2);

  // Reprograma #2: gen2 -> CANCELADA, se crea gen3 (PENDIENTE).
  appointment.date = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  appointment.time = "09:00";
  const gen3Pending = buildAppointmentReminders({
    id: appointment.id,
    date: appointment.date,
    time: appointment.time,
  });

  const secondReschedule = await notifyAppointmentRescheduled(
    appointment,
    fakeClient,
    activeAfterFirst,
    gen3Pending
  );

  const gen2Ids = new Set(gen2Pending.map((reminder) => reminder.id));
  const gen3Ids = new Set(gen3Pending.map((reminder) => reminder.id));

  const gen2Result = secondReschedule.reminders.filter((reminder) => gen2Ids.has(reminder.id));
  const gen3Result = secondReschedule.reminders.filter((reminder) => gen3Ids.has(reminder.id));

  assert.equal(gen2Result.length, 2);
  for (const reminder of gen2Result) {
    assert.equal(reminder.status, "CANCELADA");
  }

  assert.equal(gen3Result.length, 2);
  for (const reminder of gen3Result) {
    assert.notEqual(reminder.status, "CANCELADA");
  }

  // Historial completo tras 2 reprogramaciones: gen1 (CANCELADA, no
  // tocada en la 2da ronda) + gen2 (CANCELADA) + gen3 (activa). Ninguna
  // generación vieja queda PENDIENTE/PROGRAMADA.
  const fullHistory = [
    ...historyAfterFirst.filter((reminder) => gen1.some((g1) => g1.id === reminder.id)),
    ...secondReschedule.reminders,
  ];
  const stillOpenFromOldGenerations = fullHistory.filter(
    (reminder) => !gen3Ids.has(reminder.id) && reminder.status !== "CANCELADA"
  );
  assert.deepEqual(stillOpenFromOldGenerations, []);
});
