// Utilidades del módulo Agenda: franjas horarias, navegación de
// semana y armado de la cuadrícula semanal. Funciones puras (mismo
// patrón que lib/utils/clients.ts y lib/utils/services.ts) para que
// sigan funcionando igual el día que las citas vengan de una API real.

import type { Appointment } from "../types";

// Horario de atención representado en la agenda: franjas fijas de una
// hora, de 08:00 a 18:00. En esta primera etapa una cita ocupa
// exactamente una franja (no hay bloqueo de varias franjas por
// duración larga).
export const AGENDA_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Lunes a domingo, en ese orden: mismo orden en que deben mostrarse
// las columnas de la vista semanal.
export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const WEEKDAY_LABELS_LONG = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const APPOINTMENT_DURATION_OPTIONS = [30, 45, 60, 90, 120];

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDaysToISODate(value: string, days: number): string {
  const date = parseISODate(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function isToday(value: string): boolean {
  return value === toISODate(new Date());
}

export function formatAgendaDate(value: string): string {
  const formatted = new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseISODate(value));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getAppointmentsForDate(
  appointments: Appointment[],
  date: string
): Appointment[] {
  return appointments.filter((appointment) => appointment.date === date);
}

// ---------------------------------------------------------------------------
// Vista semanal
// ---------------------------------------------------------------------------

// Lunes de la semana ISO (lunes a domingo) que contiene `value`.
export function getStartOfWeek(value: string): string {
  const date = parseISODate(value);
  const day = date.getDay(); // 0 = domingo, 1 = lunes, ... 6 = sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return toISODate(date);
}

export function addWeeksToISODate(value: string, weeks: number): string {
  return addDaysToISODate(value, weeks * 7);
}

// Las 7 fechas (lunes a domingo) de la semana que empieza en `weekStart`.
export function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    addDaysToISODate(weekStart, index)
  );
}

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getStartOfWeek(toISODate(new Date()));
}

// Etiqueta legible del rango de la semana, p. ej. "8 – 14 de septiembre de 2026"
// o "29 sept – 5 oct de 2026" cuando la semana cruza de mes.
export function formatWeekRangeLabel(weekDates: string[]): string {
  const start = parseISODate(weekDates[0]);
  const end = parseISODate(weekDates[weekDates.length - 1]);

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  const dayFormatter = new Intl.DateTimeFormat("es-EC", { day: "numeric" });
  const shortFormatter = new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
  });
  const yearFormatter = new Intl.DateTimeFormat("es-EC", {
    month: "long",
    year: "numeric",
  });

  if (sameMonth) {
    return `${dayFormatter.format(start)} – ${dayFormatter.format(end)} de ${yearFormatter.format(
      end
    )}`;
  }

  return `${shortFormatter.format(start)} – ${shortFormatter.format(
    end
  )} de ${end.getFullYear()}`;
}

export interface AgendaCell {
  date: string;
  time: string;
  /**
   * Citas activas que ocupan esta franja. Puede haber más de una cuando
   * se está viendo "Todas" las profesionales y varias tienen cita a la
   * misma hora (cada una en su propia agenda no se solapa entre sí, ver
   * hasScheduleConflict). Una cita con duración mayor a 60 minutos
   * aparece en cada franja que cubre, no solo en la de inicio.
   */
  appointments: Appointment[];
}

export interface AgendaWeekRow {
  time: string;
  cells: AgendaCell[];
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Dos rangos [inicio, inicio+duración) se solapan si cada uno empieza
// antes de que el otro termine. Se usa tanto para saber qué franjas
// ocupa una cita en la cuadrícula como para prevenir doble reserva.
export function rangesOverlap(
  startA: string,
  durationA: number,
  startB: string,
  durationB: number
): boolean {
  const startAMinutes = timeToMinutes(startA);
  const startBMinutes = timeToMinutes(startB);
  return (
    startAMinutes < startBMinutes + durationB &&
    startBMinutes < startAMinutes + durationA
  );
}

function appointmentCoversSlot(appointment: Appointment, time: string): boolean {
  const slotMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(appointment.time);
  return (
    slotMinutes >= startMinutes && slotMinutes < startMinutes + appointment.duration
  );
}

// Cruza las franjas fijas de la semana con las citas activas de esas
// fechas. Una cita cancelada deja libre la franja (no se muestra como
// ocupada ni bloquea reagendar), aunque el registro se conserva para
// el historial. El llamador decide de antemano qué citas entran aquí
// (p. ej. filtradas por profesional), esta función solo arma la
// cuadrícula con lo que recibe.
export function buildWeekAgenda(
  appointments: Appointment[],
  weekDates: string[]
): AgendaWeekRow[] {
  const activeByDate = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    if (appointment.status === "CANCELADA") continue;
    if (!weekDates.includes(appointment.date)) continue;
    const list = activeByDate.get(appointment.date);
    if (list) list.push(appointment);
    else activeByDate.set(appointment.date, [appointment]);
  }

  return AGENDA_HOURS.map((time) => ({
    time,
    cells: weekDates.map((date) => ({
      date,
      time,
      appointments: (activeByDate.get(date) ?? []).filter((appointment) =>
        appointmentCoversSlot(appointment, time)
      ),
    })),
  }));
}

// Evita doble reserva: hay conflicto si la misma profesional ya tiene una
// cita activa (no cancelada) cuyo rango de horario se solapa con el
// nuevo, en la misma fecha, excluyendo opcionalmente la cita que se está
// editando. Las citas de una profesional nunca bloquean la agenda de
// otra: la validación siempre se hace sobre profesionalId + fecha +
// hora + duración.
export function hasScheduleConflict(
  appointments: Appointment[],
  professionalId: string,
  date: string,
  time: string,
  duration: number,
  excludeAppointmentId?: string
): boolean {
  return appointments.some(
    (appointment) =>
      appointment.professionalId === professionalId &&
      appointment.date === date &&
      appointment.status !== "CANCELADA" &&
      appointment.id !== excludeAppointmentId &&
      rangesOverlap(appointment.time, appointment.duration, time, duration)
  );
}
