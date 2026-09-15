-- =============================================================================
-- RLS TEMPORAL: public.clients
-- =============================================================================
--
-- Esta migración agrega policies TEMPORALES de acceso público
-- (select/insert/update) únicamente sobre public.clients, para permitir
-- que la etapa "Migrar módulo Clientes a Supabase" funcione con la key
-- publishable/anon (ver lib/supabase/server.ts y lib/supabase/client.ts),
-- sin usar service_role ni secret key.
--
-- Contexto: la migración 20260909201050_initial_vega_studio_schema.sql
-- activó RLS en todas las tablas SIN policies, a propósito, porque sin
-- Supabase Auth conectado no existe forma segura de expresar
-- "el usuario autenticado puede leer/escribir esto" (auth.uid() es
-- siempre null). Esta migración no cambia esa decisión de fondo: solo
-- abre temporalmente public.clients para poder avanzar con la
-- migración progresiva de los stores en memoria.
--
-- IMPORTANTE:
--   * Estas policies son TEMPORALES. Existen únicamente mientras la
--     aplicación no tiene Supabase Auth conectado.
--   * Cuando se implemente Auth, deben eliminarse (drop policy) y
--     reemplazarse por policies basadas en auth.uid() y en el rol del
--     usuario (profiles.role), replicando lib/permissions.ts.
--   * NO deben considerarse las policies definitivas de producción.
--   * No se modifica ninguna otra tabla, ni RLS de ninguna otra tabla,
--     ni la migración inicial 20260909201050_initial_vega_studio_schema.sql.

create policy "TEMP - select clients (sin Auth)"
  on public.clients
  for select
  using (true);

create policy "TEMP - insert clients (sin Auth)"
  on public.clients
  for insert
  with check (true);

create policy "TEMP - update clients (sin Auth)"
  on public.clients
  for update
  using (true)
  with check (true);
