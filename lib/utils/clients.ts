// Cálculos y búsquedas derivadas para el módulo de Clientes. Reciben
// los datos como parámetros (mismo patrón que lib/utils/dashboard.ts)
// para que sigan funcionando igual el día que los datos vengan de una
// API real: solo cambia quién las llama, no su lógica.

import type { Client, Sale, SaleItem } from "../types";

export function searchClients(clients: Client[], query: string): Client[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return clients;

  return clients.filter((client) => {
    return (
      client.fullName.toLowerCase().includes(normalizedQuery) ||
      client.cedula.toLowerCase().includes(normalizedQuery) ||
      client.phone.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function findClientById(
  clients: Client[],
  id: string
): Client | undefined {
  return clients.find((client) => client.id === id);
}

export interface ClientSaleWithItems extends Sale {
  items: SaleItem[];
}

// Historial de ventas de un cliente, de más reciente a más antigua.
export function getClientSalesHistory(
  clientId: string,
  sales: Sale[],
  saleItems: SaleItem[]
): ClientSaleWithItems[] {
  return sales
    .filter((sale) => sale.clientId === clientId)
    .map((sale) => ({
      ...sale,
      items: saleItems.filter((item) => item.saleId === sale.id),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export interface ClientSummary {
  visitsCount: number;
  totalSpent: number;
  servicesCount: number;
}

// Recibe el historial ya calculado (getClientSalesHistory) para no
// recorrer las ventas dos veces.
export function getClientSummary(
  salesHistory: ClientSaleWithItems[]
): ClientSummary {
  return {
    visitsCount: salesHistory.length,
    totalSpent: salesHistory.reduce((sum, sale) => sum + sale.total, 0),
    servicesCount: salesHistory.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    ),
  };
}
