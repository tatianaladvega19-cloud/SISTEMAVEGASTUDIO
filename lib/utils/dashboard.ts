// Cálculos derivados para el Dashboard. Reciben los datos como
// parámetros (en vez de importar los mocks directamente) para que
// estas funciones sirvan igual el día que los datos vengan de una API
// real: solo cambia quién las llama, no su lógica.

import type { Sale, SaleItem, Client, ActivityLog, User } from "../types";

export interface DashboardMetrics {
  salesCount: number;
  totalRevenue: number;
  clientsCount: number;
  servicesSoldCount: number;
}

export function getDashboardMetrics(
  sales: Sale[],
  clients: Client[],
  saleItems: SaleItem[]
): DashboardMetrics {
  return {
    salesCount: sales.length,
    totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
    clientsCount: clients.length,
    servicesSoldCount: saleItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export interface SaleWithDetails extends Sale {
  clientName: string;
  items: SaleItem[];
}

export function getRecentSales(
  sales: Sale[],
  clients: Client[],
  saleItems: SaleItem[],
  limit = 5
): SaleWithDetails[] {
  const clientsById = new Map(clients.map((client) => [client.id, client]));

  return [...sales]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
    .map((sale) => ({
      ...sale,
      clientName:
        clientsById.get(sale.clientId)?.fullName ?? "Cliente no encontrado",
      items: saleItems.filter((item) => item.saleId === sale.id),
    }));
}

export function getRecentClients(clients: Client[], limit = 5): Client[] {
  return [...clients]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  quantitySold: number;
  totalRevenue: number;
}

// Se agrupa por SaleItem (no por Service) a propósito: serviceName es
// el snapshot histórico y es lo que corresponde reportar, aunque el
// servicio original haya cambiado de nombre o precio después.
export function getTopServices(saleItems: SaleItem[], limit = 5): TopService[] {
  const bucket = new Map<string, TopService>();

  for (const item of saleItems) {
    const existing = bucket.get(item.serviceId);
    if (existing) {
      existing.quantitySold += item.quantity;
      existing.totalRevenue += item.subtotal;
    } else {
      bucket.set(item.serviceId, {
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        quantitySold: item.quantity,
        totalRevenue: item.subtotal,
      });
    }
  }

  return [...bucket.values()]
    .sort(
      (a, b) =>
        b.quantitySold - a.quantitySold || b.totalRevenue - a.totalRevenue
    )
    .slice(0, limit);
}

export interface ActivityWithUser extends ActivityLog {
  userName: string;
}

export function getRecentActivity(
  logs: ActivityLog[],
  users: User[],
  limit = 5
): ActivityWithUser[] {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return [...logs]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
    .map((log) => ({
      ...log,
      userName: usersById.get(log.userId)?.name ?? "Usuario desconocido",
    }));
}
