// Pruebas de las funciones puras de lib/data/alerts-store.ts (mapeo de
// filas y payload de inserción de internal_alerts). Viven en esta
// carpeta por la misma razón que appointment-reminders-store.test.ts
// (ver ese archivo): package.json → "test" solo apunta a
// lib/notifications/__tests__/*.test.ts.
//
// Las funciones async (getRecentAlerts, getUnreadAlertsCount,
// createAlert, markAlertRead, markAllAlertsRead) usan
// lib/supabase/server.ts y no se prueban en este harness (dependen de
// next/headers → cookies(), que solo funciona dentro de una petición
// real de Next.js).

import test from "node:test";
import assert from "node:assert/strict";
import { buildAlertInsertRow, mapRowToAlert } from "../../data/alerts-store";

test("buildAlertInsertRow(): mapea un NewAlertInput completo a las columnas de internal_alerts", () => {
  const row = buildAlertInsertRow({
    type: "APPOINTMENT_CREATED",
    title: "Nueva cita",
    message: "Michelle Andrade tiene cita el 20 de septiembre, 10:00.",
    appointmentId: "appt-1",
    clientId: "client-1",
    priority: "NORMAL",
  });

  assert.deepEqual(row, {
    type: "APPOINTMENT_CREATED",
    title: "Nueva cita",
    message: "Michelle Andrade tiene cita el 20 de septiembre, 10:00.",
    appointment_id: "appt-1",
    client_id: "client-1",
    priority: "NORMAL",
  });
});

test("buildAlertInsertRow(): appointmentId/clientId ausentes se guardan como null", () => {
  const row = buildAlertInsertRow({
    type: "WHATSAPP_FAILED",
    title: "WhatsApp no enviado",
    message: "No se pudo enviar el WhatsApp.",
    priority: "HIGH",
  });

  assert.equal(row.appointment_id, null);
  assert.equal(row.client_id, null);
});

test("mapRowToAlert(): traduce una fila de internal_alerts al tipo InternalAlert", () => {
  const alert = mapRowToAlert({
    id: "alert-1",
    type: "APPOINTMENT_CANCELLED",
    title: "Cita cancelada",
    message: "Michelle Andrade canceló su cita del 20 de septiembre, 10:00.",
    appointment_id: "appt-1",
    client_id: "client-1",
    created_at: "2026-09-15T12:00:00.000Z",
    read: false,
    priority: "HIGH",
  });

  assert.equal(alert.id, "alert-1");
  assert.equal(alert.type, "APPOINTMENT_CANCELLED");
  assert.equal(alert.appointmentId, "appt-1");
  assert.equal(alert.clientId, "client-1");
  assert.ok(alert.createdAt instanceof Date);
  assert.equal(alert.read, false);
  assert.equal(alert.priority, "HIGH");
});

test("mapRowToAlert(): appointment_id/client_id nulos se devuelven como undefined", () => {
  const alert = mapRowToAlert({
    id: "alert-2",
    type: "WHATSAPP_SENT",
    title: "WhatsApp enviado",
    message: "Se envió el WhatsApp de confirmación.",
    appointment_id: null,
    client_id: null,
    created_at: "2026-09-15T12:00:00.000Z",
    read: true,
    priority: "LOW",
  });

  assert.equal(alert.appointmentId, undefined);
  assert.equal(alert.clientId, undefined);
});
