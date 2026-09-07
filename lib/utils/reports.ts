// Cálculos derivados para el módulo de Reportes. Mismo patrón que
// lib/utils/dashboard.ts y lib/utils/sales.ts: funciones puras que
// reciben los datos como parámetros, para que sigan funcionando igual
// el día que vengan de una API real.

import type {
  Sale,
  SaleItem,
  Service,
  ServiceCategory,
  User,
  PaymentMethod,
} from "../types";
import type { PaymentMethodFilter } from "./sales";
import { getTopServices, type TopService } from "./dashboard";

// ---------------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------------

export interface ReportFiltersState {
  /** Fecha "desde", formato "YYYY-MM-DD" (valor nativo de <input type="date">). Vacío = sin límite inferior. */
  dateFrom: string;
  /** Fecha "hasta", mismo formato. Vacío = sin límite superior. */
  dateTo: string;
  paymentMethod: PaymentMethodFilter;
  /** User.id del vendedor, o "all". */
  sellerId: string;
}

export const defaultReportFilters: ReportFiltersState = {
  dateFrom: "",
  dateTo: "",
  paymentMethod: "all",
  sellerId: "all",
};

export function filterSales(sales: Sale[], filters: ReportFiltersState): Sale[] {
  const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
  const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`) : null;

  return sales.filter((sale) => {
    if (from && sale.createdAt < from) return false;
    if (to && sale.createdAt > to) return false;
    if (filters.paymentMethod !== "all" && sale.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    if (filters.sellerId !== "all" && sale.sellerId !== filters.sellerId) return false;

    return true;
  });
}

// Los SaleItem no tienen fecha/método/vendedor propios: dependen de la
// venta a la que pertenecen. Una vez filtradas las ventas, esta
// función acota los ítems al mismo conjunto.
export function filterSaleItemsBySales(saleItems: SaleItem[], sales: Sale[]): SaleItem[] {
  const saleIds = new Set(sales.map((sale) => sale.id));
  return saleItems.filter((item) => saleIds.has(item.saleId));
}

// ---------------------------------------------------------------------------
// 2. Tarjetas principales
// ---------------------------------------------------------------------------

export interface ReportMetrics {
  totalRevenue: number;
  salesCount: number;
  averageTicket: number;
  uniqueClientsCount: number;
}

export function getReportMetrics(sales: Sale[]): ReportMetrics {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = sales.length;

  return {
    totalRevenue,
    salesCount,
    averageTicket: salesCount === 0 ? 0 : totalRevenue / salesCount,
    uniqueClientsCount: new Set(sales.map((sale) => sale.clientId)).size,
  };
}

// ---------------------------------------------------------------------------
// 3. Rendimiento de ventas en el tiempo
// ---------------------------------------------------------------------------

export interface SalesByDatePoint {
  /** Clave estable en horario local ("YYYY-MM-DD"), para agrupar sin desfases de zona horaria. */
  dateKey: string;
  date: Date;
  revenue: number;
  salesCount: number;
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSalesByDate(sales: Sale[]): SalesByDatePoint[] {
  const bucket = new Map<string, SalesByDatePoint>();

  for (const sale of sales) {
    const dateKey = toLocalDateKey(sale.createdAt);
    const existing = bucket.get(dateKey);
    if (existing) {
      existing.revenue += sale.total;
      existing.salesCount += 1;
    } else {
      bucket.set(dateKey, {
        dateKey,
        date: sale.createdAt,
        revenue: sale.total,
        salesCount: 1,
      });
    }
  }

  return [...bucket.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ---------------------------------------------------------------------------
// 4. Servicios más vendidos
// ---------------------------------------------------------------------------

export type TopServiceReport = TopService;

export function getTopServicesReport(saleItems: SaleItem[], limit = 5): TopServiceReport[] {
  return getTopServices(saleItems, limit);
}

// ---------------------------------------------------------------------------
// 5. Métodos de pago
// ---------------------------------------------------------------------------

export interface PaymentMethodReport {
  method: PaymentMethod;
  count: number;
  revenue: number;
  /** 0-100. */
  percentage: number;
}

const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  "EFECTIVO",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
];

export function getPaymentMethodReport(sales: Sale[]): PaymentMethodReport[] {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return ALL_PAYMENT_METHODS.map((method) => {
    const methodSales = sales.filter((sale) => sale.paymentMethod === method);
    const revenue = methodSales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      method,
      count: methodSales.length,
      revenue,
      percentage: totalRevenue === 0 ? 0 : (revenue / totalRevenue) * 100,
    };
  })
    .filter((report) => report.count > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

// ---------------------------------------------------------------------------
// 6. Rendimiento por vendedor
// ---------------------------------------------------------------------------

export interface SellerPerformanceReport {
  sellerId: string;
  sellerName: string;
  salesCount: number;
  totalRevenue: number;
  averageTicket: number;
}

export function getSellerPerformance(
  sales: Sale[],
  users: User[]
): SellerPerformanceReport[] {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const bucket = new Map<string, SellerPerformanceReport>();

  for (const sale of sales) {
    const existing = bucket.get(sale.sellerId);
    if (existing) {
      existing.salesCount += 1;
      existing.totalRevenue += sale.total;
    } else {
      bucket.set(sale.sellerId, {
        sellerId: sale.sellerId,
        sellerName: usersById.get(sale.sellerId)?.name ?? "Vendedor desconocido",
        salesCount: 1,
        totalRevenue: sale.total,
        averageTicket: 0,
      });
    }
  }

  return [...bucket.values()]
    .map((report) => ({
      ...report,
      averageTicket: report.salesCount === 0 ? 0 : report.totalRevenue / report.salesCount,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// ---------------------------------------------------------------------------
// 7. Ingresos por categoría
// ---------------------------------------------------------------------------

export interface CategoryPerformanceReport {
  categoryId: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
}

const SIN_CATEGORIA_ID = "sin-categoria";

export function getCategoryPerformance(
  saleItems: SaleItem[],
  services: Service[],
  categories: ServiceCategory[]
): CategoryPerformanceReport[] {
  const servicesById = new Map(services.map((service) => [service.id, service]));
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const bucket = new Map<string, CategoryPerformanceReport>();

  for (const item of saleItems) {
    const service = servicesById.get(item.serviceId);
    const categoryId = service?.categoryId ?? SIN_CATEGORIA_ID;
    const categoryName = categoriesById.get(categoryId)?.name ?? "Sin categoría";

    const existing = bucket.get(categoryId);
    if (existing) {
      existing.quantitySold += item.quantity;
      existing.totalRevenue += item.subtotal;
    } else {
      bucket.set(categoryId, {
        categoryId,
        categoryName,
        quantitySold: item.quantity,
        totalRevenue: item.subtotal,
      });
    }
  }

  return [...bucket.values()].sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// ---------------------------------------------------------------------------
// Vendedores disponibles para el filtro
// ---------------------------------------------------------------------------

export function getAvailableSellers(users: User[]): User[] {
  return users.filter((user) => user.role === "VENDEDOR");
}
