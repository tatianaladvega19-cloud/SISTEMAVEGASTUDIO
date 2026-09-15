// Datos de ejemplo (mock) del centro de notificaciones interno.
// Igual que lib/mocks/appointments.ts, las fechas son relativas al
// momento en que se abre la app para que el centro de notificaciones
// no se vea vacío al probarlo por primera vez.

import type { InternalAlert } from "../types";

const now = Date.now();

function minutesAgo(minutes: number): Date {
  return new Date(now - minutes * 60 * 1000);
}

export const mockAlerts: InternalAlert[] = [
  {
    id: "alert-001",
    type: "APPOINTMENT_CREATED",
    title: "Nueva cita",
    message: "Michelle Andrade tiene cita hoy, 10:00.",
    appointmentId: "appt-001",
    clientId: "client-001",
    createdAt: minutesAgo(20),
    read: false,
    priority: "NORMAL",
  },
  {
    id: "alert-002",
    type: "APPOINTMENT_CREATED",
    title: "Nueva cita",
    message: "Katherine Solís tiene cita hoy, 13:00.",
    appointmentId: "appt-002",
    clientId: "client-002",
    createdAt: minutesAgo(60),
    read: true,
    priority: "NORMAL",
  },
];
