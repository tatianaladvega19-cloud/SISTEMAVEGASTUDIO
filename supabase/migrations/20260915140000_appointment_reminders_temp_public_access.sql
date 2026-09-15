-- =============================================================================
-- RLS TEMPORAL: public.appointment_reminders
-- =============================================================================
--
-- Esta migración agrega policies TEMPORALES de acceso público sobre
-- public.appointment_reminders, mismo patrón y mismo motivo que
-- 20260909210000_clients_temp_public_access.sql (Clientes),
-- 20260909220000_services_temp_public_access.sql (Servicios),
-- 20260915120000_professionals_temp_public_access.sql (Profesionales) y
-- 20260915130000_appointments_temp_public_access.sql (Citas): sin
-- Supabase Auth conectado no existe forma segura de expresar "el
-- usuario autenticado puede leer/escribir esto" (auth.uid() es siempre
-- null), así que esta migración abre temporalmente el acceso con la key
-- publishable/anon para poder conectar
-- lib/data/appointment-reminders-store.ts (recordatorios 24h/1h de la
-- clienta, ver lib/notifications/appointment-notifications.ts).
--
-- Contexto: la migración 20260909201050_initial_vega_studio_schema.sql
-- activó RLS en todas las tablas SIN policies, a propósito. Esta
-- migración no cambia esa decisión de fondo: solo abre temporalmente
-- public.appointment_reminders. No se modifica ninguna otra tabla ni
-- las policies temporales ya existentes.
--
-- IMPORTANTE:
--   * Estas policies son TEMPORALES. Existen únicamente mientras la
--     aplicación no tiene Supabase Auth conectado.
--   * Cuando se implemente Auth, deben eliminarse (drop policy) y
--     reemplazarse por policies basadas en auth.uid() y en el rol del
--     usuario (profiles.role), replicando lib/permissions.ts
--     (PERMISOS_POR_ROL.agenda).
--   * NO deben considerarse las policies definitivas de producción.
--
-- Alcance de acceso (solo lo que usa lib/data/appointment-reminders-store.ts hoy):
--   * select: leer los recordatorios (historial completo) de una cita,
--     para poblar Appointment.reminders y decidir cuáles cancelar/
--     reprogramar.
--   * insert: crear los 2 recordatorios (24h/1h, CLIENTA) al agendar o
--     al reprogramar una cita.
--   * update: marcar status/canal/twilio_message_sid/sent_at cuando se
--     programa, se envía o se cancela un recordatorio. Nunca se cambia
--     appointment_id/type/recipient_role desde la aplicación.
--   * No se agrega policy de delete: los recordatorios anteriores NUNCA
--     se borran (quedan con status CANCELADA, ver
--     lib/notifications/appointment-notifications.ts), así se preserva
--     el historial completo de la cita.

create policy "TEMP - select appointment_reminders (sin Auth)"
  on public.appointment_reminders
  for select
  using (true);

create policy "TEMP - insert appointment_reminders (sin Auth)"
  on public.appointment_reminders
  for insert
  with check (true);

create policy "TEMP - update appointment_reminders (sin Auth)"
  on public.appointment_reminders
  for update
  using (true)
  with check (true);
