// Capa temporal de datos para Ventas.
//
// Mismo patrón que lib/data/clients-store.ts: mientras no exista una
// API/base de datos real, este módulo es la única fuente de verdad
// para "ventas registradas en la sesión actual". Vive en memoria del
// proceso del servidor: sobrevive entre peticiones mientras el
// servidor de Next.js siga corriendo, pero se pierde si se reinicia.
//
// El día que exista backend real, solo este archivo debería cambiar
// (sus funciones pasarían a hacer fetch/consultas a la API en vez de
// leer arrays en memoria); el resto de la app ya consume estas
// funciones y no las listas `mockSales`/`mockSaleItems` directamente.

import { mockSales, mockSaleItems } from "@/lib/mocks/sales";
import type { Sale, SaleItem, PaymentMethod } from "@/lib/types";

const sessionSales: Sale[] = [];
const sessionSaleItems: SaleItem[] = [];
let nextSessionSaleId = 1;

export function getAllSales(): Sale[] {
  return [...mockSales, ...sessionSales];
}

export function getAllSaleItems(): SaleItem[] {
  return [...mockSaleItems, ...sessionSaleItems];
}

export interface NewSaleItemInput {
  serviceId: string;
  /** Copia histórica del nombre del servicio (ver SaleItem.serviceName). */
  serviceName: string;
  /** Copia histórica del precio unitario (ver SaleItem.unitPrice). */
  unitPrice: number;
  quantity: number;
}

export interface NewSaleInput {
  clientId: string;
  sellerId: string;
  paymentMethod: PaymentMethod;
  items: NewSaleItemInput[];
}

export function createSale(input: NewSaleInput): Sale {
  const now = new Date();
  const saleId = `sale-session-${nextSessionSaleId++}`;

  const items: SaleItem[] = input.items.map((item, index) => ({
    id: `${saleId}-item-${index + 1}`,
    saleId,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.unitPrice * item.quantity,
  }));

  const sale: Sale = {
    id: saleId,
    clientId: input.clientId,
    sellerId: input.sellerId,
    paymentMethod: input.paymentMethod,
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
    createdAt: now,
  };

  sessionSales.push(sale);
  sessionSaleItems.push(...items);
  return sale;
}
