// Utilidades de formateo compartidas por toda la app. Centralizadas
// aquí para no duplicar lógica de presentación (moneda, fechas,
// etiquetas de enums) en cada página o componente.

import type {
  PaymentMethod,
  ClientSource,
  AppointmentStatus,
  NotificationTiming,
  NotificationRecipientRole,
  NotificationStatus,
} from "../types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export function formatPaymentMethod(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method];
}

const CLIENT_SOURCE_LABELS: Record<ClientSource, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  REFERIDO: "Referido",
  CLIENTE_DIRECTO: "Cliente directo",
  PUBLICIDAD: "Publicidad",
  OTRO: "Otro",
};

export function formatClientSource(source: ClientSource): string {
  return CLIENT_SOURCE_LABELS[source];
}

// Opciones legibles de ClientSource, en el orden en que deben
// mostrarse en selects de formulario.
export const CLIENT_SOURCE_OPTIONS: Array<{
  value: ClientSource;
  label: string;
}> = (
  Object.keys(CLIENT_SOURCE_LABELS) as ClientSource[]
).map((value) => ({
  value,
  label: CLIENT_SOURCE_LABELS[value],
}));

// COMPLETADA se muestra como "Atendida" (la cita ya fue atendida). El
// valor interno del tipo se mantiene igual para no romper los datos
// ni la lógica existentes; solo cambia la etiqueta visible.
const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PROGRAMADA: "Programada",
  CONFIRMADA: "Confirmada",
  COMPLETADA: "Atendida",
  CANCELADA: "Cancelada",
};

export function formatAppointmentStatus(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_LABELS[status];
}

const REMINDER_TIMING_LABELS: Record<NotificationTiming, string> = {
  "24H_ANTES": "24 horas antes",
  "1H_ANTES": "1 hora antes",
};

export function formatReminderTiming(timing: NotificationTiming): string {
  return REMINDER_TIMING_LABELS[timing];
}

const REMINDER_RECIPIENT_LABELS: Record<NotificationRecipientRole, string> = {
  CLIENTA: "Clienta",
};

export function formatReminderRecipient(role: NotificationRecipientRole): string {
  return REMINDER_RECIPIENT_LABELS[role];
}

const REMINDER_STATUS_LABELS: Record<NotificationStatus, string> = {
  PENDIENTE: "Pendiente",
  PROGRAMADA: "Programada",
  ENVIADA: "Enviada",
  FALLIDA: "Fallida",
  CANCELADA: "Cancelada",
};

export function formatReminderStatus(status: NotificationStatus): string {
  return REMINDER_STATUS_LABELS[status];
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// Tiempo relativo compacto para el centro de notificaciones (p. ej.
// "hace 20 min", "hace 1 h"). No usa Intl.RelativeTimeFormat porque el
// formato deseado ("hace 1 h" en vez de "hace 1 hora") es más corto y
// consistente con el mockup del centro de notificaciones.
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "justo ahora";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  return `hace ${diffDays} d`;
}
