// Datos de ejemplo (mock) de auditoría (ActivityLog) de VEGA STUDIO.
//
// Nota: el modelo Sale todavía no tiene un campo de estado (por ejemplo
// "COMPLETED" | "CANCELLED"), así que el registro SALE_CANCELLED de
// abajo es solo ilustrativo: referencia una venta real del catálogo
// para demostrar el tipo de acción, pero anular una venta en el
// sistema real requerirá primero agregar ese campo a Sale.

import { ActivityLog } from "../types";
import { mockAdmin, mockVendedor } from "./users";
import { mockClients } from "./clients";
import { catMaquillaje } from "./service-categories";
import { mockServices } from "./services";
import { mockSales } from "./sales";

const michelle = mockClients[0];
const balayage = mockServices.find((s) => s.id === "svc-color-balayage")!;
const perfiladoLabios = mockServices.find(
  (s) => s.id === "svc-micro-labios-perfilado"
)!;
const ultimaVenta = mockSales[mockSales.length - 1];
const primeraVenta = mockSales[0];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "log-001",
    userId: mockAdmin.id,
    action: "LOGIN",
    entityType: "USER",
    entityId: mockAdmin.id,
    description: "Inicio de sesión del administrador.",
    createdAt: new Date("2024-05-20T08:00:00"),
  },
  {
    id: "log-002",
    userId: mockVendedor.id,
    action: "LOGIN",
    entityType: "USER",
    entityId: mockVendedor.id,
    description: "Inicio de sesión de la vendedora.",
    createdAt: new Date("2024-05-20T08:05:00"),
  },
  {
    id: "log-003",
    userId: mockVendedor.id,
    action: "CREATE",
    entityType: "CLIENT",
    entityId: michelle.id,
    description: `Registró al cliente ${michelle.fullName}.`,
    createdAt: new Date("2024-05-20T11:15:00"),
  },
  {
    id: "log-004",
    userId: mockVendedor.id,
    action: "SALE_CREATED",
    entityType: "SALE",
    entityId: primeraVenta.id,
    description: `Registró la venta ${primeraVenta.id} para ${michelle.fullName} por $${primeraVenta.total.toFixed(2)}.`,
    createdAt: primeraVenta.createdAt,
  },
  {
    id: "log-005",
    userId: mockAdmin.id,
    action: "CREATE",
    entityType: "SERVICE_CATEGORY",
    entityId: catMaquillaje.id,
    description: `Creó la categoría ${catMaquillaje.name}.`,
    createdAt: new Date("2024-01-05T08:20:00"),
  },
  {
    id: "log-006",
    userId: mockAdmin.id,
    action: "UPDATE",
    entityType: "SERVICE",
    entityId: balayage.id,
    description: `Actualizó el precio de ${balayage.name} de $80.00 a $${balayage.price.toFixed(2)}.`,
    createdAt: new Date("2024-07-01T10:00:00"),
  },
  {
    id: "log-007",
    userId: mockAdmin.id,
    action: "DELETE",
    entityType: "SERVICE",
    entityId: perfiladoLabios.id,
    description: `Desactivó (eliminación lógica) el servicio ${perfiladoLabios.name}.`,
    createdAt: new Date("2024-06-01T12:00:00"),
  },
  {
    id: "log-008",
    userId: mockAdmin.id,
    action: "EXPORT",
    entityType: "SALE",
    entityId: ultimaVenta.id,
    description: "Exportó el reporte de ventas correspondiente a julio 2024.",
    createdAt: new Date("2024-08-01T09:00:00"),
  },
  {
    id: "log-009",
    userId: mockAdmin.id,
    action: "SALE_CANCELLED",
    entityType: "SALE",
    entityId: ultimaVenta.id,
    description: `Ejemplo ilustrativo de anulación sobre la venta ${ultimaVenta.id} (pendiente de campo de estado en Sale).`,
    createdAt: new Date("2024-08-01T09:10:00"),
  },
  {
    id: "log-010",
    userId: mockVendedor.id,
    action: "LOGOUT",
    entityType: "USER",
    entityId: mockVendedor.id,
    description: "Cierre de sesión de la vendedora.",
    createdAt: new Date("2024-07-25T19:00:00"),
  },
];
