// Datos de ejemplo (mock) de citas de Agenda. A diferencia de los
// demás módulos, las fechas se calculan en relación al día en que se
// abre la app (en vez de quedar fijas en el pasado) para que la
// agenda de "Hoy" siempre tenga algo que mostrar al probarla.

import type { Appointment } from "../types";
import { addDaysToISODate, toISODate } from "../utils/agenda";
import { buildAppointmentReminders } from "../utils/notifications";
import { profCamila, profLupita, profVanessa } from "./professionals";

const today = toISODate(new Date());
const tomorrow = addDaysToISODate(today, 1);

export const mockAppointments: Appointment[] = [
  {
    id: "appt-001",
    clientId: "client-001",
    clientName: "Michelle Andrade",
    serviceId: "svc-pestanas-lifting",
    serviceName: "Lifting de pestañas",
    professionalId: profCamila.id,
    professionalName: profCamila.name,
    date: today,
    time: "10:00",
    duration: 60,
    status: "PROGRAMADA",
    notes: "Primera vez, revisar alergias a productos.",
    reminders: buildAppointmentReminders({
      id: "appt-001",
      date: today,
      time: "10:00",
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "appt-002",
    clientId: "client-002",
    clientName: "Katherine Solís",
    serviceId: "svc-cejas-microblading",
    serviceName: "Microblading de cejas",
    professionalId: profLupita.id,
    professionalName: profLupita.name,
    date: today,
    time: "13:00",
    duration: 90,
    status: "CONFIRMADA",
    notes: undefined,
    reminders: buildAppointmentReminders({
      id: "appt-002",
      date: today,
      time: "13:00",
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "appt-003",
    clientId: "client-001",
    clientName: "Michelle Andrade",
    serviceId: "svc-cejas-microblading",
    serviceName: "Microblading de cejas",
    professionalId: profVanessa.id,
    professionalName: profVanessa.name,
    date: tomorrow,
    time: "16:00",
    duration: 90,
    status: "PROGRAMADA",
    notes: undefined,
    reminders: buildAppointmentReminders({
      id: "appt-003",
      date: tomorrow,
      time: "16:00",
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
