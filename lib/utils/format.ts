// Utilidades de formateo compartidas por toda la app. Centralizadas
// aquí para no duplicar lógica de presentación (moneda, fechas,
// etiquetas de enums) en cada página o componente.

import type { PaymentMethod, ClientSource } from "../types";

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
