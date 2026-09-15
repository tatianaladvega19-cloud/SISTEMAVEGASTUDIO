// Modelo de datos base de VEGA STUDIO.
//
// Estos tipos representan la forma futura de los datos una vez que
// existan API y base de datos reales. Por ahora son solo contratos de
// TypeScript: no hay persistencia, ni validación, ni autenticación.

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export type Role = "ADMIN" | "VENDEDOR";

// La contraseña NUNCA vive aquí: este es el modelo público del
// usuario (el que se muestra en Sidebar, Topbar, /perfil, etc.). Las
// credenciales se manejan aparte, en lib/mocks/credentials.ts y
// lib/auth/credentials.ts, para que el día que exista backend real
// el modelo User pueda mapearse tal cual a la tabla pública de
// usuarios sin arrastrar datos sensibles.
export interface User {
  id: string;
  name: string;
  /** Único; se usa como identificador visible alternativo al email. */
  username: string;
  email: string;
  role: Role;
  isActive: boolean;
  /**
   * URL de la foto de perfil. Mientras no exista subida real de
   * archivos, puede ser un object URL temporal (ver
   * components/profile/ProfileForm.tsx). Si no está definida, la UI
   * debe mostrar las iniciales del usuario (ver lib/auth/session.ts:
   * getInitials).
   */
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

// Canal por el que llegó el cliente. Se define aquí como tipo cerrado;
// si en el futuro se vuelve administrable desde el panel, puede migrarse
// a un modelo propio (similar a ServiceCategory).
export type ClientSource =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "REFERIDO"
  | "CLIENTE_DIRECTO"
  | "PUBLICIDAD"
  | "OTRO";

export interface Client {
  id: string;
  fullName: string;
  /** Debe ser única en la futura base de datos. */
  cedula: string;
  phone: string;
  email?: string;
  address?: string;
  source: ClientSource;
  createdAt: Date;
  updatedAt: Date;
  /** User.id de quien registró el cliente. */
  createdBy: string;
}

// ---------------------------------------------------------------------------
// ServiceCategory
// ---------------------------------------------------------------------------

// Las categorías (Pestañas, Micropigmentación de cejas, etc.) NO se
// hardcodean aquí: se crean y administran como datos desde el panel Admin.
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Service {
  id: string;
  name: string;
  /** ServiceCategory.id */
  categoryId: string;
  description?: string;
  /**
   * Precio vigente del servicio. Puede cambiar con el tiempo; NO debe
   * usarse como fuente de verdad para ventas ya registradas. Cada venta
   * conserva su propio precio histórico en SaleItem.unitPrice.
   */
  price: number;
  /**
   * Duración típica/sugerida en minutos (columna services.duration).
   * Nullable en Supabase: queda undefined mientras no se defina. No
   * reemplaza Appointment.duration, que es la duración elegida al
   * agendar cada cita puntual.
   */
  duration?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Professional
// ---------------------------------------------------------------------------

// Profesional/empleada que realiza servicios (Camila, Lupita, Vanessa,
// etc.). Es un concepto distinto de User: User representa cuentas con
// acceso al sistema (ADMIN/VENDEDOR, para login y permisos), mientras que
// Professional representa a quien atiende la cita, exista o no como
// usuario del sistema. Ningún nombre se hardcodea en la lógica: se
// administran como datos (mismo patrón que ServiceCategory) para poder
// agregarse, editarse o desactivarse desde Administración sin tocar el
// resto del módulo de Agenda.
export interface Professional {
  id: string;
  name: string;
  /** Ej. "Micropigmentación", "Pestañas". Libre, no es un catálogo cerrado. */
  specialty?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// ServiceProfessional
// ---------------------------------------------------------------------------

// Relación muchos a muchos entre Service y Professional: un servicio puede
// ser realizado por una o varias profesionales, y una profesional puede
// realizar varios servicios. Se modela como tabla de unión (igual que lo
// haría una base de datos real) en vez de anidar listas dentro de Service
// o de Professional, para no duplicar esa relación en dos lugares.
export interface ServiceProfessional {
  /** Service.id */
  serviceId: string;
  /** Professional.id */
  professionalId: string;
}

// ---------------------------------------------------------------------------
// PaymentMethod
// ---------------------------------------------------------------------------

export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO";

// ---------------------------------------------------------------------------
// Sale
// ---------------------------------------------------------------------------

// Una venta, una vez registrada, es inmutable para el rol VENDEDOR
// (ver lib/permissions.ts: ventas.editarHistorico / ventas.eliminar).
export interface Sale {
  id: string;
  /** Client.id */
  clientId: string;
  /** User.id del vendedor que registró la venta. */
  sellerId: string;
  paymentMethod: PaymentMethod;
  /**
   * Guardado en el registro por ahora. A futuro debe calcularse siempre
   * como la suma de SaleItem.subtotal en vez de mantenerse duplicado.
   */
  total: number;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// SaleItem
// ---------------------------------------------------------------------------

export interface SaleItem {
  id: string;
  /** Sale.id */
  saleId: string;
  /** Service.id original, solo como referencia. */
  serviceId: string;
  /**
   * Copia histórica del nombre del servicio en el momento de la venta.
   * Se guarda aparte porque Service.name puede cambiar después.
   */
  serviceName: string;
  /**
   * Copia histórica del precio unitario en el momento de la venta.
   * Se guarda aparte porque Service.price puede cambiar después.
   */
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------

export type AppointmentStatus =
  | "PROGRAMADA"
  | "CONFIRMADA"
  | "COMPLETADA"
  | "CANCELADA";

// ---------------------------------------------------------------------------
// AppointmentReminder
// ---------------------------------------------------------------------------
//
// Estructura de datos preparada para el futuro envío de recordatorios
// automáticos de citas. Todavía NO existe integración con ningún
// proveedor externo (WhatsApp/email/SMS): por ahora solo se calcula
// cuándo debería dispararse cada recordatorio y a quién, y se deja el
// campo de estado en "PENDIENTE" para que un futuro job/cron lo
// actualice al enviarlo de verdad.

/** Momento del recordatorio relativo a la hora de la cita. */
export type NotificationTiming = "24H_ANTES" | "1H_ANTES";

/**
 * A quién debe llegar el recordatorio. Arquitectura definitiva de VEGA
 * STUDIO (ver supabase/migrations/20260909201050_initial_vega_studio_schema.sql,
 * tabla appointment_reminders): los recordatorios 24h/1h son
 * exclusivos de la CLIENTA. La administradora solo recibe el aviso
 * inmediato al crear la cita (columnas admin_notification_* de
 * Appointment más abajo), nunca un recordatorio programado.
 */
export type NotificationRecipientRole = "CLIENTA";

/** Canal por el que se envía el recordatorio. Único canal soportado: WhatsApp (Twilio). */
export type NotificationChannel = "WHATSAPP";

// PROGRAMADA: Twilio Message Scheduling aceptó el envío para
// `scheduledFor` (ver lib/notifications/twilio.ts). CANCELADA: la cita
// se reprogramó o canceló antes de que Twilio llegara a enviarlo.
export type NotificationStatus =
  | "PENDIENTE"
  | "PROGRAMADA"
  | "ENVIADA"
  | "FALLIDA"
  | "CANCELADA";

export interface AppointmentReminder {
  id: string;
  /** Appointment.id */
  appointmentId: string;
  timing: NotificationTiming;
  recipientRole: NotificationRecipientRole;
  /** Sin asignar mientras no exista un proveedor de envío configurado. */
  channel?: NotificationChannel;
  status: NotificationStatus;
  /** Fecha/hora calculada en la que debería dispararse el envío. */
  scheduledFor: Date;
  sentAt?: Date;
  /**
   * SID del mensaje programado en Twilio (equivalente a
   * reminder24hId/reminder1hId), necesario para poder cancelarlo si la
   * cita se reprograma o cancela (ver PASO 12/13). Solo se asigna
   * cuando Twilio confirma la programación.
   */
  providerMessageId?: string;
}

export interface Appointment {
  id: string;
  /** Client.id */
  clientId: string;
  /**
   * Copia histórica del nombre del cliente en el momento de agendar.
   * Se guarda aparte porque Client.fullName puede cambiar después
   * (mismo patrón que SaleItem.serviceName con Service.name).
   */
  clientName: string;
  /** Service.id */
  serviceId: string;
  /** Copia histórica del nombre del servicio en el momento de agendar. */
  serviceName: string;
  /** Professional.id de quien atiende la cita. */
  professionalId: string;
  /**
   * Copia histórica del nombre de la profesional en el momento de
   * agendar. Se guarda aparte porque Professional.name puede cambiar
   * después (mismo patrón que clientName/serviceName).
   */
  professionalName: string;
  /** Fecha de la cita, formato "YYYY-MM-DD". */
  date: string;
  /** Hora de inicio, formato "HH:mm" (una de AGENDA_HOURS). */
  time: string;
  /** Duración en minutos. */
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  /**
   * Recordatorios asociados a esta cita (24h y 1h antes, para
   * administradora y clienta). Se generan al crear la cita mediante
   * `buildAppointmentReminders` (lib/utils/notifications.ts). El envío
   * real todavía no está implementado; esto solo deja preparada la
   * estructura para conectarlo después.
   */
  reminders: AppointmentReminder[];
  /**
   * SID del WhatsApp de confirmación enviado a la clienta al crear la
   * cita (ver lib/notifications/appointment-notifications.ts). Su
   * presencia es lo que evita reenviar la confirmación dos veces
   * (idempotencia, PASO 17).
   */
  confirmationMessageId?: string;
  confirmationStatus?: NotificationStatus;
  /** Mensaje de error de Twilio si el envío falló. Nunca credenciales. */
  confirmationError?: string;
  /** SID del WhatsApp de aviso enviado a la administradora al crear la cita. */
  adminNotificationMessageId?: string;
  adminNotificationStatus?: NotificationStatus;
  adminNotificationError?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// InternalAlert (centro de notificaciones interno)
// ---------------------------------------------------------------------------
//
// Alertas mostradas en el centro de notificaciones de VEGA STUDIO (ver
// components/notifications/NotificationBell.tsx). Se generan como
// efecto secundario de los eventos de Agenda (crear/reprogramar/
// cancelar cita, envíos de WhatsApp), nunca las crea el usuario a mano.

export type AlertType =
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_RESCHEDULED"
  | "APPOINTMENT_CANCELLED"
  | "REMINDER"
  | "WHATSAPP_SENT"
  | "WHATSAPP_FAILED";

export type AlertPriority = "LOW" | "NORMAL" | "HIGH";

export interface InternalAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  /** Appointment.id relacionada, si aplica. */
  appointmentId?: string;
  /** Client.id relacionado, si aplica. */
  clientId?: string;
  createdAt: Date;
  read: boolean;
  priority: AlertPriority;
}

/** Datos necesarios para crear una alerta (ver lib/data/alerts-store.ts). */
export interface NewAlertInput {
  type: AlertType;
  title: string;
  message: string;
  appointmentId?: string;
  clientId?: string;
  priority: AlertPriority;
}

// ---------------------------------------------------------------------------
// ActivityLog
// ---------------------------------------------------------------------------

// Tipo de entidad afectada por la acción auditada. Cerrado a las
// entidades del sistema para que los reportes de auditoría sean
// consistentes.
export type EntityType =
  | "USER"
  | "CLIENT"
  | "SERVICE_CATEGORY"
  | "SERVICE"
  | "SALE";

// Acciones auditables. Tipo cerrado para que los reportes de auditoría
// sean consistentes y filtrables.
export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT"
  | "SALE_CREATED"
  | "SALE_CANCELLED";

export interface ActivityLog {
  id: string;
  /** User.id de quien ejecutó la acción. */
  userId: string;
  action: ActivityAction;
  entityType: EntityType;
  /** id de la entidad afectada (Client.id, Sale.id, etc.). */
  entityId: string;
  description: string;
  createdAt: Date;
}
