-- Vincula profiles con Supabase Auth (PASO: login real de VEGA STUDIO).
--
-- Hasta ahora profiles.id era un uuid propio, sin relación con
-- auth.users, y la tabla no tenía ninguna policy de RLS (ver el
-- comentario "ROW LEVEL SECURITY" al final de
-- 20260909201050_initial_vega_studio_schema.sql): con la clave
-- publishable, cualquier consulta a profiles devolvía 0 filas. Esta
-- migración conecta ambas piezas para que app/login pueda autenticar
-- con Supabase Auth (supabase.auth.signInWithPassword) y luego leer el
-- rol (ADMIN/VENDEDOR) de quien inició sesión.
--
-- Pasos manuales que siguen (fuera de esta migración, porque requieren
-- credenciales que nunca deben vivir en el código):
--   1. Crear cada usuario real en Supabase Dashboard -> Authentication
--      -> Users -> Add user (o supabase.auth.admin.createUser desde un
--      script propio con la service role key, ejecutado por ti, no
--      commiteado). Ahí se define la contraseña real.
--   2. Copiar el UUID que Supabase Auth asignó a ese usuario.
--   3. Insertar (o actualizar) la fila en profiles usando ESE MISMO
--      UUID como id, junto con name/username/role:
--        insert into profiles (id, name, username, email, role, active)
--        values ('<uuid-de-auth-users>', 'Nombre Apellido', 'usuario', 'correo@vegastudio.com', 'ADMIN', true);
--   4. Repetir por cada cuenta real (ADMIN y VENDEDOR).

-- profiles.id ya no se genera solo: siempre debe coincidir con el id
-- de un usuario real de auth.users (paso manual de arriba).
alter table profiles alter column id drop default;

alter table profiles
  add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- Un usuario autenticado solo puede leer su propia fila de profiles
-- (lo mínimo necesario para que el login resuelva nombre/rol). No se
-- agregan policies de insert/update/delete: la gestión de cuentas
-- (pantalla /usuarios) sigue fuera del alcance de este cambio.
create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (auth.uid() = id);
