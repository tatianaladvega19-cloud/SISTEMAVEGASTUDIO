// Cálculos, relaciones, búsqueda y filtros derivados para el módulo
// de Ventas. Reciben los datos como parámetros (mismo patrón que
// lib/utils/dashboard.ts, lib/utils/clients.ts y lib/utils/services.ts)
// para que sigan funcionando igual el día que los datos vengan de una
// API real: solo cambia quién las llama, no su lógica.

import type { Sale, SaleItem, Client, User, PaymentMethod } from "../types";
import type { SaleWithDetails } from "./dashboard";

// ---------------------------------------------------------------------------
// Relación Sale <-> Client / User / SaleItem
// ---------------------------------------------------------------------------

// Extiende SaleWithDetails (definido en dashboard.ts para el widget de
// "Últimas ventas") con los datos de contacto del cliente y el
// vendedor que necesita el listado completo del módulo de Ventas.
export interface SaleWithClientDetails extends SaleWithDetails {
  clientCedula: string;
  clientPhone: string;
  sellerName: string;
  servicesCount: number;
}

export function getSalesWithDetails(
  sales: Sale[],
  clients: Client[],
  users: User[],
  saleItems: SaleItem[]
): SaleWithClientDetails[] {
  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const usersById = new Map(users.map((user) => [user.id, user]));

  return [...sales]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((sale) => {
      const client = clientsById.get(sale.clientId);
      const items = saleItems.filter((item) => item.saleId === sale.id);

      return {
        ...sale,
        clientName: client?.fullName ?? "Cliente no encontrado",
        clientCedula: client?.cedula ?? "—",
        clientPhone: client?.phone ?? "—",
        sellerName: usersById.get(sale.sellerId)?.name ?? "Vendedor desconocido",
        items,
        servicesCount: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    });
}

// ---------------------------------------------------------------------------
// Métricas del resumen superior
// ---------------------------------------------------------------------------

export interface SalesMetrics {
  salesCount: number;
  totalRevenue: number;
  servicesSoldCount: number;
  averageTicket: number;
}

export function getSalesMetrics(
  sales: Sale[],
  saleItems: SaleItem[]
): SalesMetrics {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return {
    salesCount: sales.length,
    totalRevenue,
    servicesSoldCount: saleItems.reduce((sum, item) => sum + item.quantity, 0),
    averageTicket: sales.length === 0 ? 0 : totalRevenue / sales.length,
  };
}

// ---------------------------------------------------------------------------
// Búsqueda y filtros del listado de ventas
// ---------------------------------------------------------------------------

export function searchSales(
  sales: SaleWithClientDetails[],
  query: string
): SaleWithClientDetails[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return sales;

  return sales.filter((sale) => {
    return (
      sale.clientName.toLowerCase().includes(normalizedQuery) ||
      sale.clientCedula.toLowerCase().includes(normalizedQuery) ||
      sale.clientPhone.toLowerCase().includes(normalizedQuery)
    );
  });
}

export type PaymentMethodFilter = "all" | PaymentMethod;

export interface SaleFiltersState {
  search: string;
  paymentMethod: PaymentMethodFilter;
}

export const defaultSaleFilters: SaleFiltersState = {
  search: "",
  paymentMethod: "all",
};

export function filterSales(
  sales: SaleWithClientDetails[],
  filters: SaleFiltersState
): SaleWithClientDetails[] {
  const searched = searchSales(sales, filters.search);

  if (filters.paymentMethod === "all") return searched;

  return searched.filter((sale) => sale.paymentMethod === filters.paymentMethod);
}

// ---------------------------------------------------------------------------
// Carrito de "nueva venta" (borrador en memoria del cliente, antes de
// registrarse como Sale/SaleItem reales).
// ---------------------------------------------------------------------------

export interface DraftSaleItem {
  serviceId: string;
  serviceName: string;
  unitPrice: number;
  quantity: number;
}

export interface DraftSaleSummary {
  servicesCount: number;
  subtotal: number;
  total: number;
}

// El modelo actual no tiene impuestos ni descuentos, así que el total
// es siempre igual al subtotal; se calculan por separado de todos
// modos para que la UI pueda mostrar ambas líneas como pide el flujo
// de registro de venta.
export function getDraftSaleSummary(items: DraftSaleItem[]): DraftSaleSummary {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return {
    servicesCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    total: subtotal,
  };
}
