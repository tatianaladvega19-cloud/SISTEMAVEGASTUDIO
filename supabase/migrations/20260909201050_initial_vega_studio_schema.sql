-- VEGA STUDIO — esquema inicial en PostgreSQL/Supabase.
--
-- Este esquema es el equivalente en base de datos de los tipos hoy
-- definidos en lib/types.ts y de los datos que hoy viven en memoria en
-- lib/data/*-store.ts (respaldados por lib/mocks/*.ts). Todavía NO se
-- conecta ningún store ni componente a estas tablas (eso es una
-- segunda etapa): esta migración solo crea el esquema para poder
-- validarlo antes de migrar la persistencia real.
--
-- Convenciones:
--   * Todas las primary keys son uuid generadas por PostgreSQL
--     (gen_random_uuid(), de la extensión pgcrypto), nunca ids
--     temporales de memoria como los "client-session-N" actuales.
--   * created_at/updated_at son timestamptz con default now();
--     updated_at se mantiene al día con el trigger set_updated_at()
--     definido más abajo.
--   * Los valores permitidos en las columnas de estado/tipo (CHECK)
--     usan EXACTAMENTE el mismo vocabulario que los union types de
--     lib/types.ts hoy (incluye español, p. ej. "PROGRAMADA"), para no
--     romper el código existente cuando se migren los stores. Ver la
--     nota de incompatibilidad al final de este archivo.
--     EXCEPCIÓN deliberada: appointment_reminders.type/recipient_role/
--     channel NO replican NotificationType/NotificationRecipientRole/
--     NotificationChannel de lib/types.ts (que hoy todavía incluyen
--     CONFIRMATION/ADMIN_NOTIFICATION, ADMINISTRADORA y EMAIL/SMS).
--     Esos tipos de TypeScript describen la lógica ANTERIOR (en
--     memoria, lib/utils/notifications.ts: buildAppointmentReminders,
--     que aún no está conectada a esta tabla); esta migración ya
--     modela la lógica DEFINITIVA acordada (solo REMINDER_24H/
--     REMINDER_1H, solo CLIENTA, solo WHATSAPP). Cuando se migren los
--     stores a Supabase, lib/types.ts deberá angostarse para que
--     coincida con este esquema, no al revés.
--   * RLS queda activado en todas las tablas pero SIN políticas
--     públicas todavía (ver sección "ROW LEVEL SECURITY" al final):
--     el proyecto no tiene Supabase Auth conectado en esta etapa, así
--     que no hay forma segura de decidir "quién es quién" desde SQL.
--     Dejar las tablas bloqueadas por defecto es la opción segura
--     mientras tanto.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- Función reutilizada por todos los triggers "BEFORE UPDATE" de este
-- archivo para mantener updated_at al día sin repetir lógica.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: User (hoy en lib/mocks/users.ts).
-- Representa únicamente a los usuarios internos (ADMIN/VENDEDOR) que
-- inician sesión en el sistema; NO son lo mismo que "professionals"
-- (ver más abajo). No se implementa Supabase Auth todavía: `id` es un
-- uuid propio, no una referencia a auth.users. Cuando se conecte Auth,
-- lo natural será que profiles.id pase a ser el mismo id de
-- auth.users (patrón estándar de Supabase), pero ese cambio queda
-- fuera de esta migración.
create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  -- Identificador visible alternativo (lib/types.ts: User.username).
  -- El login actual (components/auth/LoginForm.tsx) usa el email, pero
  -- username se muestra y se edita desde /perfil, así que debe
  -- conservarse para no perder esa funcionalidad.
  username text not null,
  email text not null,
  phone text,
  role text not null check (role in ('ADMIN', 'VENDEDOR')),
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_key unique (username),
  constraint profiles_email_key unique (email)
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- service_categories
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: ServiceCategory (lib/mocks/service-categories.ts).
-- No estaba en la lista de entidades del pedido, pero services.categoryId
-- ya la referencia hoy (module Servicios agrupa y filtra por categoría,
-- ver lib/utils/services.ts): sin esta tabla, services.category_id no
-- tendría a qué apuntar.
create table service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger service_categories_set_updated_at
  before update on service_categories
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: Client (lib/mocks/clients.ts).
create table clients (
  id uuid primary key default gen_random_uuid(),
  -- Client.fullName.
  full_name text not null,
  -- Client.cedula. Se nombra "identification" porque así lo pidió
  -- explícitamente el pedido; es el mismo dato, no uno nuevo.
  identification text not null,
  phone text not null,
  email text,
  address text,
  -- Nuevo respecto al modelo actual (Client no tiene "notes" hoy).
  -- Columna nullable: no rompe nada porque ningún código la usa
  -- todavía; queda preparada para cuando se necesite.
  notes text,
  -- Client.source (canal de llegada). Es parte del modelo actual y
  -- debe conservarse aunque el pedido no lo mencionara explícitamente.
  source text not null default 'OTRO' check (
    source in (
      'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'REFERIDO',
      'CLIENTE_DIRECTO', 'PUBLICIDAD', 'OTRO'
    )
  ),
  -- Client.createdBy (User.id de quien registró el cliente).
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_identification_key unique (identification)
);

create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

-- La búsqueda de clientes (lib/utils/clients.ts: searchClients) filtra
-- por nombre, cédula/identificación y teléfono; identification ya
-- queda indexada por el unique de arriba.
create index clients_full_name_idx on clients (full_name);
create index clients_phone_idx on clients (phone);

-- ---------------------------------------------------------------------------
-- professionals
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: Professional (lib/mocks/professionals.ts:
-- Camila, Lupita, Vanessa). specialty/phone/email son nuevos respecto
-- al modelo actual (Professional solo tiene name/isActive hoy): quedan
-- nullable para no romper nada y preparar el futuro panel de
-- Administración de profesionales.
create table professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  phone text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger professionals_set_updated_at
  before update on professionals
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: Service (lib/mocks/services.ts).
create table services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references service_categories(id) on delete set null,
  name text not null,
  description text,
  -- Nuevo respecto al modelo actual: hoy la duración se elige por
  -- cita (APPOINTMENT_DURATION_OPTIONS en lib/utils/agenda.ts), no por
  -- servicio. Se deja nullable como duración típica/sugerida en
  -- minutos para uso futuro; no reemplaza appointments.duration.
  duration integer,
  price numeric(10, 2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger services_set_updated_at
  before update on services
  for each row execute function set_updated_at();

create index services_category_id_idx on services (category_id);

-- ---------------------------------------------------------------------------
-- service_professionals
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: ServiceProfessional
-- (lib/mocks/service-professionals.ts): relación muchos a muchos entre
-- Service y Professional. No estaba en la lista de entidades del
-- pedido, pero sin ella se perdería qué profesional puede realizar
-- cada servicio (lib/utils/professionals.ts: getProfessionalsForService),
-- que es lo que arma el selector de profesional en Agenda.
create table service_professionals (
  service_id uuid not null references services(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  primary key (service_id, professional_id)
);

create index service_professionals_professional_id_idx
  on service_professionals (professional_id);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: Appointment (lib/data/appointments-store.ts).
create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  professional_id uuid not null references professionals(id),
  service_id uuid not null references services(id),
  date date not null,
  start_time time not null,
  duration integer not null,
  -- AppointmentStatus (lib/types.ts) usa estos 4 valores en español
  -- hoy: se conservan tal cual para no romper AppointmentStatusBadge,
  -- AGENDA (hasScheduleConflict/buildWeekAgenda), etc. Ver nota de
  -- incompatibilidad al final del archivo.
  status text not null default 'PROGRAMADA' check (
    status in ('PROGRAMADA', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA')
  ),
  notes text,
  -- Appointment.confirmationMessageId / confirmationStatus / confirmationError.
  confirmation_message_id text,
  confirmation_status text check (
    confirmation_status in ('PENDIENTE', 'PROGRAMADA', 'ENVIADA', 'FALLIDA', 'CANCELADA')
  ),
  confirmation_error text,
  -- Appointment.adminNotificationMessageId / adminNotificationStatus / adminNotificationError.
  admin_notification_message_id text,
  admin_notification_status text check (
    admin_notification_status in ('PENDIENTE', 'PROGRAMADA', 'ENVIADA', 'FALLIDA', 'CANCELADA')
  ),
  admin_notification_error text,
  -- SIDs de conveniencia pedidos explícitamente (PASO 10): reflejan el
  -- último recordatorio 24h/1h programado para esta cita. El detalle
  -- completo (uno por tipo/destinatario) vive en appointment_reminders;
  -- estas dos columnas son solo un acceso rápido sin tener que unir
  -- con esa tabla.
  reminder24h_id text,
  reminder1h_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger appointments_set_updated_at
  before update on appointments
  for each row execute function set_updated_at();

create index appointments_date_idx on appointments (date);
create index appointments_professional_id_idx on appointments (professional_id);
create index appointments_client_id_idx on appointments (client_id);
create index appointments_service_id_idx on appointments (service_id);
create index appointments_status_idx on appointments (status);
create index appointments_professional_id_date_idx
  on appointments (professional_id, date);

-- Concurrencia de citas (PASO 18): una misma profesional no puede tener
-- dos citas activas (no CANCELADA) cuyo horario se solape, en la misma
-- fecha. Esto es EXACTAMENTE lib/utils/agenda.ts: hasScheduleConflict,
-- pero aplicado también del lado de la base de datos (no solo desde el
-- Server Action) para que no dependa únicamente de la interfaz ni de
-- que el código de la app recuerde llamarlo. Se calcula el rango real
-- [inicio, inicio+duración) con una columna generada y se usa un
-- EXCLUDE de PostgreSQL (requiere btree_gist, habilitada arriba) para
-- que la propia base de datos rechace el INSERT/UPDATE que se solape.
-- (duration * interval '1 minute'), no (duration || ' minutos')::interval:
-- el cast de texto a interval depende de configuración de sesión
-- (STABLE) y PostgreSQL rechaza expresiones no IMMUTABLE en columnas
-- generadas; multiplicar un interval literal por un entero sí es
-- IMMUTABLE.
alter table appointments
  add column time_range tsrange generated always as (
    tsrange(
      (date + start_time)::timestamp,
      (date + start_time)::timestamp + (duration * interval '1 minute'),
      '[)'
    )
  ) stored;

alter table appointments
  add constraint appointments_no_overlap_per_professional
  exclude using gist (professional_id with =, time_range with &&)
  where (status <> 'CANCELADA');

-- ---------------------------------------------------------------------------
-- appointment_reminders
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: AppointmentReminder (el arreglo
-- Appointment.reminders que arma lib/utils/notifications.ts:
-- buildAppointmentReminders). Cada cita genera únicamente 2 filas:
-- REMINDER_24H y REMINDER_1H, ambas para la CLIENTA. La confirmación
-- inmediata a la clienta y el aviso inmediato a la administradora NO
-- son recordatorios programados: ya tienen sus propias columnas en
-- appointments (confirmation_message_id/... y
-- admin_notification_message_id/...) y no generan filas aquí. Los
-- recordatorios 24h/1h son exclusivos de la clienta: la administradora
-- nunca recibe un recordatorio programado, solo el aviso inmediato de
-- creación (columna admin_notification_* en appointments) más la
-- internal_alert correspondiente.
create table appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  -- Únicos tipos de recordatorio PROGRAMADO que existen en la lógica
  -- definitiva de VEGA STUDIO. CONFIRMATION y ADMIN_NOTIFICATION NO
  -- son recordatorios programados (son notificaciones inmediatas al
  -- crear la cita) y por eso no viven en esta tabla: su estado se
  -- rastrea en las columnas confirmation_*/admin_notification_* de
  -- appointments.
  type text not null check (
    type in ('REMINDER_24H', 'REMINDER_1H')
  ),
  -- AppointmentReminder.recipientRole: los recordatorios 24h/1h son
  -- SOLO para la clienta (nunca se programan para la administradora),
  -- así que el único valor válido es 'CLIENTA'. Se conserva la columna
  -- (en vez de eliminarla) para no perder la relación con el modelo de
  -- lib/types.ts y para poder auditar/consultar explícitamente el
  -- destinatario de cada recordatorio.
  recipient_role text not null check (
    recipient_role in ('CLIENTA')
  ),
  -- AppointmentReminder.channel: la arquitectura definitiva de VEGA
  -- STUDIO es exclusivamente WhatsApp (sin email ni SMS), así que el
  -- único valor válido es 'WHATSAPP'. Queda nullable porque no se
  -- asigna hasta que se programa/envía.
  channel text check (channel in ('WHATSAPP')),
  -- AppointmentReminder.providerMessageId (SID de Twilio). Únicamente
  -- el SID: nunca credenciales (TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID,
  -- etc. no tienen ninguna columna en todo este esquema).
  twilio_message_sid text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text not null default 'PENDIENTE' check (
    status in ('PENDIENTE', 'PROGRAMADA', 'ENVIADA', 'FALLIDA', 'CANCELADA')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger appointment_reminders_set_updated_at
  before update on appointment_reminders
  for each row execute function set_updated_at();

create index appointment_reminders_appointment_id_idx
  on appointment_reminders (appointment_id);

-- ---------------------------------------------------------------------------
-- internal_alerts
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: InternalAlert (lib/data/alerts-store.ts,
-- lib/mocks/alerts.ts). Centro de notificaciones interno
-- (components/notifications/NotificationBell.tsx).
create table internal_alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (
    type in (
      'APPOINTMENT_CREATED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_CANCELLED',
      'REMINDER', 'WHATSAPP_SENT', 'WHATSAPP_FAILED'
    )
  ),
  title text not null,
  message text not null,
  appointment_id uuid references appointments(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  read boolean not null default false,
  priority text not null default 'NORMAL' check (priority in ('LOW', 'NORMAL', 'HIGH'))
);

create index internal_alerts_read_idx on internal_alerts (read);
create index internal_alerts_created_at_idx on internal_alerts (created_at);

-- ---------------------------------------------------------------------------
-- sales
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: Sale (lib/data/sales-store.ts,
-- lib/mocks/sales.ts).
create table sales (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  -- Sale.sellerId (User.id del vendedor). Se llama user_id porque así
  -- lo pidió explícitamente el pedido (PASO 14); mismo dato.
  user_id uuid not null references profiles(id),
  payment_method text not null check (
    payment_method in ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO')
  ),
  -- subtotal/discount son nuevos respecto al modelo actual (Sale solo
  -- tiene "total" hoy; lib/utils/sales.ts: getDraftSaleSummary deja
  -- explícito que "el modelo actual no tiene impuestos ni
  -- descuentos"). Quedan con default 0 para no romper nada: mientras
  -- el store no migre, ningún código los usa.
  subtotal numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  -- Nuevo respecto al modelo actual (Sale no tiene estado hoy). Los
  -- valores reflejan lo único que hoy es posible según
  -- lib/permissions.ts (ventas.eliminar): una venta existe o fue
  -- anulada.
  status text not null default 'COMPLETADA' check (status in ('COMPLETADA', 'ANULADA')),
  created_at timestamptz not null default now()
);

create index sales_client_id_idx on sales (client_id);
create index sales_user_id_idx on sales (user_id);
create index sales_created_at_idx on sales (created_at);

-- ---------------------------------------------------------------------------
-- sale_items
-- ---------------------------------------------------------------------------
-- Equivalente de lib/types.ts: SaleItem.
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  -- SaleItem.serviceId: "solo como referencia" (el nombre/precio
  -- históricos ya quedan copiados abajo). on delete set null para que
  -- borrar un servicio del catálogo nunca borre ni corrompa una venta
  -- ya registrada.
  service_id uuid references services(id) on delete set null,
  -- Copia histórica: SaleItem.serviceName / unitPrice, tal como exige
  -- el comentario original en lib/types.ts ("se guarda aparte porque
  -- Service.name/price puede cambiar después").
  service_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  subtotal numeric(10, 2) not null
);

create index sale_items_sale_id_idx on sale_items (sale_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
--
-- Se activa RLS en todas las tablas para que NINGUNA quede
-- públicamente accesible por default (ni siquiera de lectura) a través
-- de la Data API de Supabase con la clave anónima/publishable que usa
-- lib/supabase/client.ts. Deliberadamente NO se agrega ninguna policy
-- todavía: sin Supabase Auth conectado (PASO pendiente, ver
-- app/login/page.tsx / lib/auth/session.ts, que hoy es una sesión
-- simulada en localStorage) no existe una forma segura de expresar
-- "el usuario autenticado puede leer/escribir esto" desde SQL —
-- cualquier policy basada en auth.uid() sería o bien falsa (porque
-- auth.uid() siempre es null) o tendría que abrirse a todo el mundo,
-- que es exactamente lo que NO se quiere.
--
-- Efecto práctico ahora mismo: con la clave publishable (anon), todas
-- las consultas a estas tablas devuelven 0 filas / son rechazadas. Eso
-- no rompe nada porque en esta etapa ningún componente ni Server
-- Action consulta Supabase todavía (Agenda, Clientes, Ventas, etc.
-- siguen leyendo de lib/data/*-store.ts).
--
-- Cuando se implemente Supabase Auth, la política prevista (a
-- implementarse en una migración futura, no aquí) es:
--   1. profiles.id pasa a coincidir con auth.users.id.
--   2. Policies de escritura/lectura por rol, leyendo
--      profiles.role (ADMIN vs VENDEDOR) del usuario autenticado,
--      replicando lib/permissions.ts (PERMISOS_POR_ROL) en SQL.
--   3. Los Server Actions seguirán usando lib/supabase/server.ts
--      (createServerClient con la key publishable + cookies de
--      sesión), nunca la service_role key.
alter table profiles enable row level security;
alter table service_categories enable row level security;
alter table clients enable row level security;
alter table professionals enable row level security;
alter table services enable row level security;
alter table service_professionals enable row level security;
alter table appointments enable row level security;
alter table appointment_reminders enable row level security;
alter table internal_alerts enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
