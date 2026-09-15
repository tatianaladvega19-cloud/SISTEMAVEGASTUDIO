-- =============================================================================
-- RLS TEMPORAL: public.service_categories, public.services,
-- public.service_professionals, public.professionals
-- =============================================================================
--
-- Esta migración agrega policies TEMPORALES de acceso público sobre las
-- tablas que necesita el módulo Servicios, mismo patrón y mismo motivo
-- que 20260909210000_clients_temp_public_access.sql para Clientes: sin
-- Supabase Auth conectado no existe forma segura de expresar "el usuario
-- autenticado puede leer/escribir esto" (auth.uid() es siempre null), así
-- que esta migración abre temporalmente el acceso con la key
-- publishable/anon para poder avanzar con la migración progresiva de los
-- stores en memoria hacia Supabase (ver lib/supabase/server.ts y
-- lib/supabase/client.ts).
--
-- Contexto: la migración 20260909201050_initial_vega_studio_schema.sql
-- activó RLS en todas las tablas SIN policies, a propósito. Esta
-- migración no cambia esa decisión de fondo: solo abre temporalmente las
-- 4 tablas de abajo.
--
-- IMPORTANTE:
--   * Estas policies son TEMPORALES. Existen únicamente mientras la
--     aplicación no tiene Supabase Auth conectado.
--   * Cuando se implemente Auth, deben eliminarse (drop policy) y
--     reemplazarse por policies basadas en auth.uid() y en el rol del
--     usuario (profiles.role), replicando lib/permissions.ts
--     (PERMISOS_POR_ROL.servicios).
--   * NO deben considerarse las policies definitivas de producción.
--   * No se modifica ninguna otra tabla, ni las policies temporales de
--     public.clients (20260909210000_clients_temp_public_access.sql), ni
--     la migración inicial 20260909201050_initial_vega_studio_schema.sql.
--
-- Alcance de acceso (solo lo que la UI de Servicios usa hoy):
--   * service_categories / services: el listado, el alta (Servicios >
--     Nuevo servicio), la edición y el activar/desactivar necesitan
--     select/insert/update. No hay borrado desde la UI, así que no se
--     agrega policy de delete.
--   * service_professionals / professionals: el store (ver
--     lib/data/services-store.ts: getServiceProfessionalLinks) solo LEE
--     esta relación para preservarla de cara a un uso futuro (Agenda);
--     el formulario de Servicios de esta etapa no la crea ni la edita.
--     Por eso solo se habilita select.

create policy "TEMP - select service_categories (sin Auth)"
  on public.service_categories
  for select
  using (true);

create policy "TEMP - insert service_categories (sin Auth)"
  on public.service_categories
  for insert
  with check (true);

create policy "TEMP - update service_categories (sin Auth)"
  on public.service_categories
  for update
  using (true)
  with check (true);

create policy "TEMP - select services (sin Auth)"
  on public.services
  for select
  using (true);

create policy "TEMP - insert services (sin Auth)"
  on public.services
  for insert
  with check (true);

create policy "TEMP - update services (sin Auth)"
  on public.services
  for update
  using (true)
  with check (true);

create policy "TEMP - select service_professionals (sin Auth)"
  on public.service_professionals
  for select
  using (true);

create policy "TEMP - select professionals (sin Auth)"
  on public.professionals
  for select
  using (true);
