// Frontera entre la aplicación y Supabase para el centro de
// notificaciones interno (public.internal_alerts, ver
// supabase/migrations/20260909201050_initial_vega_studio_schema.sql).
// Mismo patrón que lib/data/appointments-store.ts: consulta
// directamente la tabla a través de lib/supabase/server.ts (key
// publishable/anon, nunca service_role). Antes este módulo guardaba las
// alertas en memoria del proceso (mockAlerts + sessionAlerts): se
// perdían al reiniciar el servidor. Ahora sobreviven, porque viven en
// Supabase.

import type { InternalAlert, NewAlertInput } from "@/lib/types";

// lib/supabase/server.ts importa next/headers (cookies()), que solo
// resuelve dentro de una petición real de Next.js. Se importa de forma
// perezosa (dynamic import) para que las funciones puras de este
// archivo (mapRowToAlert, buildAlertInsertRow) se puedan probar con
// `node --test` sin cargar next/headers (mismo motivo que
// lib/data/appointment-reminders-store.ts). No cambia el
// comportamiento en Next.js: sigue siendo el mismo cliente, solo que
// su import se resuelve la primera vez que hace falta.
async function getSupabaseServerClient() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

const ALERT_SELECT = `
  id,
  type,
  title,
  message,
  appointment_id,
  client_id,
  created_at,
  read,
  priority
`;

interface AlertRow {
  id: string;
  type: InternalAlert["type"];
  title: string;
  message: string;
  appointment_id: string | null;
  client_id: string | null;
  created_at: string;
  read: boolean;
  priority: InternalAlert["priority"];
}

// Pura, sin Supabase: traduce una fila de internal_alerts al tipo
// InternalAlert de la aplicación. Exportada para poder probarla sin
// depender de lib/supabase/server.ts (ver
// lib/notifications/__tests__/alerts-store.test.ts).
export function mapRowToAlert(row: AlertRow): InternalAlert {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    appointmentId: row.appointment_id ?? undefined,
    clientId: row.client_id ?? undefined,
    createdAt: new Date(row.created_at),
    read: row.read,
    priority: row.priority,
  };
}

// Pura, sin Supabase: arma la fila a insertar en internal_alerts a
// partir de un NewAlertInput. Exportada para poder probarla igual que
// mapRowToAlert.
export function buildAlertInsertRow(input: NewAlertInput) {
  return {
    type: input.type,
    title: input.title,
    message: input.message,
    appointment_id: input.appointmentId ?? null,
    client_id: input.clientId ?? null,
    priority: input.priority,
  };
}

// Igual que isInvalidUuidError en lib/data/appointments-store.ts: un id
// que no es un uuid válido se trata como "sin resultado", no como
// error 500.
function isInvalidUuidError(error: { code?: string } | null): boolean {
  return error?.code === "22P02";
}

export async function getRecentAlerts(limit: number): Promise<InternalAlert[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("internal_alerts")
    .select(ALERT_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`No se pudieron obtener las alertas: ${error.message}`);
  }

  return ((data ?? []) as unknown as AlertRow[]).map(mapRowToAlert);
}

export async function getUnreadAlertsCount(): Promise<number> {
  const supabase = await getSupabaseServerClient();
  const { count, error } = await supabase
    .from("internal_alerts")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  if (error) {
    throw new Error(`No se pudo contar las alertas sin leer: ${error.message}`);
  }

  return count ?? 0;
}

export async function createAlert(input: NewAlertInput): Promise<InternalAlert> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("internal_alerts")
    .insert(buildAlertInsertRow(input))
    .select(ALERT_SELECT)
    .single();

  if (error) {
    throw new Error(`No se pudo crear la alerta: ${error.message}`);
  }

  return mapRowToAlert(data as unknown as AlertRow);
}

export async function markAlertRead(id: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("internal_alerts")
    .update({ read: true })
    .eq("id", id);

  if (error && !isInvalidUuidError(error)) {
    throw new Error(`No se pudo marcar la alerta como leída: ${error.message}`);
  }
}

export async function markAllAlertsRead(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("internal_alerts")
    .update({ read: true })
    .eq("read", false);

  if (error) {
    throw new Error(`No se pudieron marcar las alertas como leídas: ${error.message}`);
  }
}
