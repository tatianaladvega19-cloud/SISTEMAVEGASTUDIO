-- =============================================================================
-- RLS TEMPORAL: public.appointments
-- =============================================================================
--
-- Esta migración agrega policies TEMPORALES de acceso público sobre
-- public.appointments, mismo patrón y mismo motivo que
-- 20260909210000_clients_temp_public_access.sql (Clientes),
-- 20260909220000_services_temp_public_access.sql (Servicios) y
-- 20260915120000_professionals_temp_public_access.sql (Profesionales):
-- sin Supabase Auth conectado no existe forma segura de expresar "el
-- usuario autenticado puede leer/escribir esto" (auth.uid() es siempre
-- null), así que esta migración abre temporalmente el acceso con la key
-- publishable/anon para poder migrar lib/data/appointments-store.ts
-- (Agenda) de memoria del servidor a Supabase.
--
-- Contexto: la migración 20260909201050_initial_vega_studio_schema.sql
-- activó RLS en todas las tablas SIN policies, a propósito. Esta
-- migración no cambia esa decisión de fondo: solo abre temporalmente
-- public.appointments. No se modifica ninguna otra tabla (ni
-- public.appointment_reminders ni public.internal_alerts, que Agenda
-- todavía no persiste en esta etapa — ver el diagnóstico previo), ni las
-- policies temporales ya existentes, ni la migración inicial.
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
-- Alcance de acceso (solo lo que Agenda usa hoy):
--   * select: listar la cuadrícula semanal y obtener una cita por id.
--   * insert: crear una cita nueva ("Nueva cita").
--   * update: reprogramar, cambiar de profesional, cambiar de estado y
--     cancelar (cancelar NUNCA borra la fila, solo cambia `status` a
--     'CANCELADA' — ver lib/data/appointments-store.ts). No se agrega
--     policy de delete: no existe ni existirá borrado físico de citas
--     desde la UI.
--   * La restricción appointments_no_overlap_per_professional (EXCLUDE
--     constraint de la migración inicial) sigue aplicándose igual con
--     estas policies: RLS solo decide QUIÉN puede intentar el
--     insert/update, el EXCLUDE constraint sigue decidiendo si ese
--     insert/update se acepta o se rechaza (23P01).

create policy "TEMP - select appointments (sin Auth)"
  on public.appointments
  for select
  using (true);

create policy "TEMP - insert appointments (sin Auth)"
  on public.appointments
  for insert
  with check (true);

create policy "TEMP - update appointments (sin Auth)"
  on public.appointments
  for update
  using (true)
  with check (true);
