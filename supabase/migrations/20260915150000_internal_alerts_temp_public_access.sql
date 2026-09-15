-- =============================================================================
-- RLS TEMPORAL: public.internal_alerts
-- =============================================================================
--
-- Esta migración agrega policies TEMPORALES de acceso público sobre
-- public.internal_alerts, mismo patrón y mismo motivo que
-- 20260915140000_appointment_reminders_temp_public_access.sql (ver ese
-- archivo para el contexto completo): sin Supabase Auth conectado no
-- existe forma segura de expresar "el usuario autenticado puede leer/
-- escribir esto" (auth.uid() es siempre null), así que esta migración
-- abre temporalmente el acceso con la key publishable/anon para poder
-- migrar lib/data/alerts-store.ts (centro de notificaciones interno,
-- ver components/notifications/NotificationBell.tsx) de memoria del
-- servidor a Supabase.
--
-- Contexto: la migración 20260909201050_initial_vega_studio_schema.sql
-- activó RLS en todas las tablas SIN policies, a propósito. Esta
-- migración no cambia esa decisión de fondo: solo abre temporalmente
-- public.internal_alerts. No se modifica ninguna otra tabla ni las
-- policies temporales ya existentes.
--
-- IMPORTANTE:
--   * Estas policies son TEMPORALES. Existen únicamente mientras la
--     aplicación no tiene Supabase Auth conectado.
--   * Cuando se implemente Auth, deben eliminarse (drop policy) y
--     reemplazarse por policies basadas en auth.uid() y en el rol del
--     usuario (profiles.role), replicando lib/permissions.ts.
--   * NO deben considerarse las policies definitivas de producción.
--
-- Alcance de acceso (solo lo que usa lib/data/alerts-store.ts hoy):
--   * select: listar las alertas recientes y contar las no leídas
--     (NotificationBell).
--   * insert: crear una alerta al crear/reprogramar/cancelar una cita
--     o al fallar un envío de WhatsApp.
--   * update: marcar una alerta (o todas) como leída (`read = true`).
--     No se modifica ningún otro campo desde la aplicación.
--   * No se agrega policy de delete: las alertas no se borran, son el
--     historial interno de eventos de Agenda.

create policy "TEMP - select internal_alerts (sin Auth)"
  on public.internal_alerts
  for select
  using (true);

create policy "TEMP - insert internal_alerts (sin Auth)"
  on public.internal_alerts
  for insert
  with check (true);

create policy "TEMP - update internal_alerts (sin Auth)"
  on public.internal_alerts
  for update
  using (true)
  with check (true);
