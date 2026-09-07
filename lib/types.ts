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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
