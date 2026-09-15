-- =============================================================================
-- RLS TEMPORAL: public.professionals, public.service_professionals
-- =============================================================================
--
-- Esta migración agrega policies TEMPORALES de acceso público sobre las
-- tablas que necesita el módulo Profesionales, mismo patrón y mismo motivo
-- que 20260909210000_clients_temp_public_access.sql (Clientes) y
-- 20260909220000_services_temp_public_access.sql (Servicios): sin
-- Supabase Auth conectado no existe forma segura de expresar "el usuario
-- autenticado puede leer/escribir esto" (auth.uid() es siempre null), así
-- que esta migración abre temporalmente el acceso con la key
-- publishable/anon para poder avanzar con la migración progresiva de los
-- stores en memoria hacia Supabase (ver lib/supabase/server.ts y
-- lib/supabase/client.ts).
--
-- Contexto: la migración 20260909201050_initial_vega_studio_schema.sql
-- activó RLS en todas las tablas SIN policies, a propósito. La migración
-- 20260909220000_services_temp_public_access.sql ya abrió
-- public.professionals y public.service_professionals, pero SOLO para
-- select (el módulo Servicios de esa etapa únicamente leía la relación
-- para preservarla de cara a un uso futuro). Esta migración amplía esas
-- dos tablas con los permisos adicionales que necesita el módulo
-- Profesionales (alta, edición, activar/desactivar y administrar la
-- relación service_professionals). No se modifica ninguna otra tabla, ni
-- las policies temporales de public.clients ni de
-- public.service_categories/public.services, ni la migración inicial
-- 20260909201050_initial_vega_studio_schema.sql.
--
-- IMPORTANTE:
--   * Estas policies son TEMPORALES. Existen únicamente mientras la
--     aplicación no tiene Supabase Auth conectado.
--   * Cuando se implemente Auth, deben eliminarse (drop policy) y
--     reemplazarse por policies basadas en auth.uid() y en el rol del
--     usuario (profiles.role), replicando lib/permissions.ts
--     (PERMISOS_POR_ROL.profesionales/agenda).
--   * NO deben considerarse las policies definitivas de producción.
--
-- Alcance de acceso (solo lo que la UI de Profesionales usa hoy):
--   * professionals: el listado, el alta (Profesionales > Nuevo
--     profesional), la edición y el activar/desactivar necesitan
--     select/insert/update. No hay borrado físico desde la UI (rule de
--     negocio: un profesional inactivo se conserva, nunca se elimina),
--     así que no se agrega policy de delete.
--   * service_professionals: lib/data/professionals-store.ts
--     (setProfessionalServices) sincroniza la relación con inserts y
--     deletes puntuales (nunca un delete-all + insert-all), así que
--     necesita select/insert/delete. No se agrega policy de update
--     porque la tabla usa clave primaria compuesta (service_id,
--     professional_id): un cambio de relación siempre se modela como
--     borrar el par viejo e insertar el par nuevo, nunca como un UPDATE
--     de fila existente.

create policy "TEMP - insert professionals (sin Auth)"
  on public.professionals
  for insert
  with check (true);

create policy "TEMP - update professionals (sin Auth)"
  on public.professionals
  for update
  using (true)
  with check (true);

create policy "TEMP - insert service_professionals (sin Auth)"
  on public.service_professionals
  for insert
  with check (true);

create policy "TEMP - delete service_professionals (sin Auth)"
  on public.service_professionals
  for delete
  using (true);
