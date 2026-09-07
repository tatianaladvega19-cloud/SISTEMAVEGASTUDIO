// Datos de ejemplo (mock) de ventas de VEGA STUDIO.
//
// Todas las ventas están registradas por la vendedora (mockVendedor).
// serviceName y unitPrice en cada SaleItem son una copia congelada del
// servicio en el momento de la venta (tal como se documenta en
// lib/types.ts), por eso NO se leen desde mockServices en tiempo de
// "consulta": se escriben explícitamente aquí, igual que ocurriría al
// registrar una venta real.
//
// sale.total siempre es igual a la suma de subtotal de sus SaleItem.

import { Sale, SaleItem } from "../types";
import { mockVendedor } from "./users";
import { mockClients } from "./clients";

const [
  michelle,
  katherine,
  daniela,
  estefania,
  paola,
  gabriela,
  valentina,
  andrea,
  melissa,
  carolina,
  fernanda,
  // nicole (client-012) todavía no tiene ventas registradas.
] = mockClients;

export const mockSales: Sale[] = [
  {
    id: "sale-001",
    clientId: michelle.id,
    sellerId: mockVendedor.id,
    paymentMethod: "TARJETA",
    total: 40,
    createdAt: new Date("2024-05-25T15:00:00"),
  },
  {
    id: "sale-002",
    clientId: michelle.id,
    sellerId: mockVendedor.id,
    paymentMethod: "EFECTIVO",
    total: 35,
    createdAt: new Date("2024-06-02T14:30:00"),
  },
  {
    id: "sale-003",
    clientId: katherine.id,
    sellerId: mockVendedor.id,
    paymentMethod: "TRANSFERENCIA",
    total: 120,
    createdAt: new Date("2024-06-05T11:00:00"),
  },
  {
    id: "sale-004",
    clientId: daniela.id,
    sellerId: mockVendedor.id,
    paymentMethod: "TARJETA",
    total: 65,
    createdAt: new Date("2024-06-10T16:15:00"),
  },
  {
    id: "sale-005",
    clientId: estefania.id,
    sellerId: mockVendedor.id,
    paymentMethod: "EFECTIVO",
    total: 25,
    createdAt: new Date("2024-06-15T10:00:00"),
  },
  {
    id: "sale-006",
    clientId: paola.id,
    sellerId: mockVendedor.id,
    paymentMethod: "TRANSFERENCIA",
    total: 90,
    createdAt: new Date("2024-06-20T13:45:00"),
  },
  {
    id: "sale-007",
    clientId: gabriela.id,
    sellerId: mockVendedor.id,
    paymentMethod: "TARJETA",
    total: 150,
    createdAt: new Date("2024-07-01T09:30:00"),
  },
  {
    id: "sale-008",
    clientId: valentina.id,
    sellerId: mockVendedor.id,
    paymentMethod: "EFECTIVO",
    total: 65,
    createdAt: new Date("2024-07-05T17:00:00"),
  },
  {
    id: "sale-009",
    clientId: andrea.id,
    sellerId: mockVendedor.id,
    paymentMethod: "OTRO",
    total: 50,
    createdAt: new Date("2024-07-10T12:20:00"),
  },
  {
    id: "sale-010",
    clientId: melissa.id,
    sellerId: mockVendedor.id,
    paymentMethod: "EFECTIVO",
    total: 60,
    createdAt: new Date("2024-07-15T15:40:00"),
  },
  {
    id: "sale-011",
    clientId: carolina.id,
    sellerId: mockVendedor.id,
    paymentMethod: "TRANSFERENCIA",
    total: 80,
    createdAt: new Date("2024-07-20T11:10:00"),
  },
  {
    id: "sale-012",
    clientId: fernanda.id,
    sellerId: mockVendedor.id,
    paymentMethod: "EFECTIVO",
    total: 210,
    createdAt: new Date("2024-07-25T14:00:00"),
  },
];

export const mockSaleItems: SaleItem[] = [
  // sale-001 — Michelle, cuando "Perfilado de labios" aún estaba activo.
  {
    id: "item-001",
    saleId: "sale-001",
    serviceId: "svc-micro-labios-perfilado",
    serviceName: "Perfilado de labios",
    unitPrice: 40,
    quantity: 1,
    subtotal: 40,
  },

  // sale-002 — Michelle
  {
    id: "item-002",
    saleId: "sale-002",
    serviceId: "svc-pestanas-clasicas",
    serviceName: "Extensión de pestañas clásicas",
    unitPrice: 35,
    quantity: 1,
    subtotal: 35,
  },

  // sale-003 — Katherine
  {
    id: "item-003",
    saleId: "sale-003",
    serviceId: "svc-cejas-microblading",
    serviceName: "Microblading de cejas",
    unitPrice: 120,
    quantity: 1,
    subtotal: 120,
  },

  // sale-004 — Daniela (2 servicios)
  {
    id: "item-004",
    saleId: "sale-004",
    serviceId: "svc-maquillaje-social",
    serviceName: "Maquillaje social",
    unitPrice: 35,
    quantity: 1,
    subtotal: 35,
  },
  {
    id: "item-005",
    saleId: "sale-004",
    serviceId: "svc-color-retoque-raiz",
    serviceName: "Retoque de raíz",
    unitPrice: 30,
    quantity: 1,
    subtotal: 30,
  },

  // sale-005 — Estefanía
  {
    id: "item-006",
    saleId: "sale-005",
    serviceId: "svc-pestanas-lifting",
    serviceName: "Lifting de pestañas",
    unitPrice: 25,
    quantity: 1,
    subtotal: 25,
  },

  // sale-006 — Paola
  {
    id: "item-007",
    saleId: "sale-006",
    serviceId: "svc-color-balayage",
    serviceName: "Balayage",
    unitPrice: 90,
    quantity: 1,
    subtotal: 90,
  },

  // sale-007 — Gabriela
  {
    id: "item-008",
    saleId: "sale-007",
    serviceId: "svc-labios-micropigmentacion",
    serviceName: "Micropigmentación de labios",
    unitPrice: 150,
    quantity: 1,
    subtotal: 150,
  },

  // sale-008 — Valentina (2 servicios)
  {
    id: "item-009",
    saleId: "sale-008",
    serviceId: "svc-pestanas-volumen-ruso",
    serviceName: "Extensión de pestañas volumen ruso",
    unitPrice: 45,
    quantity: 1,
    subtotal: 45,
  },
  {
    id: "item-010",
    saleId: "sale-008",
    serviceId: "svc-cejas-diseno-henna",
    serviceName: "Diseño y henna de cejas",
    unitPrice: 20,
    quantity: 1,
    subtotal: 20,
  },

  // sale-009 — Andrea
  {
    id: "item-011",
    saleId: "sale-009",
    serviceId: "svc-maquillaje-sesion-fotos",
    serviceName: "Maquillaje para sesión de fotos",
    unitPrice: 50,
    quantity: 1,
    subtotal: 50,
  },

  // sale-010 — Melissa
  {
    id: "item-012",
    saleId: "sale-010",
    serviceId: "svc-cejas-retoque",
    serviceName: "Retoque de micropigmentación de cejas",
    unitPrice: 60,
    quantity: 1,
    subtotal: 60,
  },

  // sale-011 — Carolina (2 servicios)
  {
    id: "item-013",
    saleId: "sale-011",
    serviceId: "svc-color-tinte-completo",
    serviceName: "Tinte completo",
    unitPrice: 45,
    quantity: 1,
    subtotal: 45,
  },
  {
    id: "item-014",
    saleId: "sale-011",
    serviceId: "svc-maquillaje-social",
    serviceName: "Maquillaje social",
    unitPrice: 35,
    quantity: 1,
    subtotal: 35,
  },

  // sale-012 — Fernanda (2 servicios)
  {
    id: "item-015",
    saleId: "sale-012",
    serviceId: "svc-maquillaje-novia",
    serviceName: "Maquillaje de novia",
    unitPrice: 120,
    quantity: 1,
    subtotal: 120,
  },
  {
    id: "item-016",
    saleId: "sale-012",
    serviceId: "svc-color-balayage",
    serviceName: "Balayage",
    unitPrice: 90,
    quantity: 1,
    subtotal: 90,
  },
];
