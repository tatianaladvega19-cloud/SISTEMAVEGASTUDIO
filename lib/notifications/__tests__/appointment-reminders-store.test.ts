// Pruebas de las funciones puras de
// lib/data/appointment-reminders-store.ts (mapeo de filas y payloads
// de inserción). Viven en esta carpeta, no en lib/data/__tests__,
// porque package.json → "test" solo apunta a
// lib/notifications/__tests__/*.test.ts (ver
// scripts/register-ts-loader.mjs).
//
// Las funciones async que sí llaman a Supabase
// (getRemindersByAppointmentId(s), createPendingReminders,
// updateReminderStatus) NO se prueban aquí: dependen de
// lib/supabase/server.ts, que llama a next/headers → cookies() y solo
// funciona dentro de una petición real de Next.js, no en `node --test`.

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReminderInsertRows,
  mapRowToReminder,
} from "../../data/appointment-reminders-store";

test("buildReminderInsertRows(): genera exactamente 2 filas, CLIENTA/PENDIENTE, 24h y 1h antes", () => {
  const rows = buildReminderInsertRows({
    id: "appt-1",
    date: "2026-09-20",
    time: "10:00",
  });

  assert.equal(rows.length, 2);

  const reminder24h = rows.find((row) => row.type === "REMINDER_24H");
  const reminder1h = rows.find((row) => row.type === "REMINDER_1H");
  assert.ok(reminder24h);
  assert.ok(reminder1h);

  for (const row of rows) {
    assert.equal(row.appointment_id, "appt-1");
    assert.equal(row.recipient_role, "CLIENTA");
    assert.equal(row.status, "PENDIENTE");
  }

  const appointmentAt = new Date(2026, 8, 20, 10, 0, 0, 0);
  assert.equal(
    new Date(reminder24h!.scheduled_for).getTime(),
    appointmentAt.getTime() - 24 * 60 * 60 * 1000
  );
  assert.equal(
    new Date(reminder1h!.scheduled_for).getTime(),
    appointmentAt.getTime() - 1 * 60 * 60 * 1000
  );
});

test("mapRowToReminder(): traduce una fila REMINDER_24H ya programada", () => {
  const reminder = mapRowToReminder({
    id: "rem-1",
    appointment_id: "appt-1",
    type: "REMINDER_24H",
    recipient_role: "CLIENTA",
    channel: "WHATSAPP",
    twilio_message_sid: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    scheduled_for: "2026-09-19T10:00:00.000Z",
    sent_at: null,
    status: "PROGRAMADA",
    created_at: "2026-09-15T00:00:00.000Z",
    updated_at: "2026-09-15T00:00:00.000Z",
  });

  assert.equal(reminder.id, "rem-1");
  assert.equal(reminder.appointmentId, "appt-1");
  assert.equal(reminder.timing, "24H_ANTES");
  assert.equal(reminder.recipientRole, "CLIENTA");
  assert.equal(reminder.channel, "WHATSAPP");
  assert.equal(reminder.providerMessageId, "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  assert.equal(reminder.status, "PROGRAMADA");
  assert.ok(reminder.scheduledFor instanceof Date);
  assert.equal(reminder.sentAt, undefined);
});

test("mapRowToReminder(): fila REMINDER_1H sin canal/SID/envío todavía (PENDIENTE)", () => {
  const reminder = mapRowToReminder({
    id: "rem-2",
    appointment_id: "appt-1",
    type: "REMINDER_1H",
    recipient_role: "CLIENTA",
    channel: null,
    twilio_message_sid: null,
    scheduled_for: "2026-09-20T09:00:00.000Z",
    sent_at: null,
    status: "PENDIENTE",
    created_at: "2026-09-15T00:00:00.000Z",
    updated_at: "2026-09-15T00:00:00.000Z",
  });

  assert.equal(reminder.timing, "1H_ANTES");
  assert.equal(reminder.channel, undefined);
  assert.equal(reminder.providerMessageId, undefined);
  assert.equal(reminder.status, "PENDIENTE");
});
