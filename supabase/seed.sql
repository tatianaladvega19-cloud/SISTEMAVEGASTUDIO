-- Datos de prueba OPCIONALES para VEGA STUDIO.
--
-- Este archivo NO se ejecuta automáticamente al aplicar migraciones
-- (`supabase db push` / `supabase migration up` solo corren lo que hay
-- en supabase/migrations/). Solo se ejecuta si alguien lo pide
-- explícitamente, por ejemplo:
--   supabase db reset        (entorno LOCAL: recrea la base local y
--                              corre migrations + este seed)
--   psql "$DATABASE_URL" -f supabase/seed.sql   (contra un proyecto puntual)
--
-- Es un espejo, en forma de INSERT, de los datos hoy hardcodeados en
-- lib/mocks/*.ts (mismos nombres: Camila/Lupita/Vanessa, Vanessa Vega
-- admin, Camila Torres vendedora, las mismas categorías/servicios).
-- Se usan uuids fijos (no gen_random_uuid()) únicamente para que las
-- referencias entre INSERTs de este archivo sean legibles y estables
-- entre corridas; no tienen ningún significado especial.

begin;

-- profiles ------------------------------------------------------------------
insert into profiles (id, name, username, email, role, active) values
  ('00000000-0000-0000-0000-000000000001', 'Vanessa Vega', 'vanessa.vega', 'vanessa@vegastudio.com', 'ADMIN', true),
  ('00000000-0000-0000-0000-000000000002', 'Camila Torres', 'camila.torres', 'camila.torres@vegastudio.com', 'VENDEDOR', true);

-- professionals ---------------------------------------------------------
insert into professionals (id, name, active) values
  ('00000000-0000-0000-0000-000000000101', 'Camila', true),
  ('00000000-0000-0000-0000-000000000102', 'Lupita', true),
  ('00000000-0000-0000-0000-000000000103', 'Vanessa', true);

-- service_categories ------------------------------------------------------
insert into service_categories (id, name, description, active) values
  ('00000000-0000-0000-0000-000000000201', 'Pestañas', 'Extensión, lifting y tratamientos de pestañas.', true),
  ('00000000-0000-0000-0000-000000000202', 'Micropigmentación de cejas', 'Diseño y micropigmentación semipermanente de cejas.', true),
  ('00000000-0000-0000-0000-000000000203', 'Micropigmentación de labios', 'Micropigmentación y perfilado de labios.', true),
  ('00000000-0000-0000-0000-000000000204', 'Colorización y tintes', 'Coloración, tintes y tratamientos capilares.', true),
  ('00000000-0000-0000-0000-000000000205', 'Maquillaje', 'Maquillaje social, novias y eventos.', true);

-- services ------------------------------------------------------------------
insert into services (id, category_id, name, description, price, active) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'Lifting de pestañas', 'Curvado y tinte de pestañas naturales.', 25, true),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', 'Extensión de pestañas clásicas', 'Aplicación pelo a pelo.', 35, true),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000202', 'Microblading de cejas', 'Técnica manual de pelo a pelo.', 120, true),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000203', 'Micropigmentación de labios', 'Aplicación de pigmento en labios.', 150, true),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000204', 'Tinte completo', 'Aplicación de color en todo el cabello.', 45, true),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000205', 'Maquillaje social', 'Maquillaje para eventos y salidas.', 35, true);

-- service_professionals -----------------------------------------------------
insert into service_professionals (service_id, professional_id) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000103'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000101');

-- clients ---------------------------------------------------------------
insert into clients (id, full_name, identification, phone, email, source, created_by) values
  ('00000000-0000-0000-0000-000000000401', 'Michelle Andrade', '1712345678', '+593987654321', 'michelle@example.com', 'INSTAGRAM', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000402', 'Katherine Solís', '1798765432', '+593998765432', null, 'REFERIDO', '00000000-0000-0000-0000-000000000002');

commit;
