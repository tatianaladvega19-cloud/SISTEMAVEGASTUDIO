// Datos de ejemplo (mock) de clientes de VEGA STUDIO.
// Incluye variación intencional: algunos clientes sin email, algunos
// sin dirección, y distintas fuentes de adquisición, para poder probar
// la UI con casos realistas (campos opcionales presentes o ausentes).

import { Client } from "../types";
import { mockAdmin, mockVendedor } from "./users";

export const mockClients: Client[] = [
  {
    id: "client-001",
    fullName: "Michelle Andrade",
    cedula: "1102345678",
    phone: "0987654321",
    email: "michelle.andrade@gmail.com",
    address: "Av. Amazonas N34-120, Quito",
    source: "INSTAGRAM",
    createdAt: new Date("2024-05-20T11:15:00"),
    updatedAt: new Date("2024-05-20T11:15:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-002",
    fullName: "Katherine Solís",
    cedula: "1103456789",
    phone: "0998765432",
    // sin email
    address: "Cdla. La Alborada, Guayaquil",
    source: "FACEBOOK",
    createdAt: new Date("2024-05-22T16:40:00"),
    updatedAt: new Date("2024-05-22T16:40:00"),
    createdBy: mockAdmin.id,
  },
  {
    id: "client-003",
    fullName: "Daniela Chávez",
    cedula: "0923456780",
    phone: "0945612378",
    email: "daniela.chavez88@hotmail.com",
    // sin dirección
    source: "TIKTOK",
    createdAt: new Date("2024-05-28T09:05:00"),
    updatedAt: new Date("2024-05-28T09:05:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-004",
    fullName: "Estefanía Rojas",
    cedula: "1756789012",
    phone: "0912345678",
    // sin email
    // sin dirección
    source: "REFERIDO",
    createdAt: new Date("2024-06-01T13:20:00"),
    updatedAt: new Date("2024-06-01T13:20:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-005",
    fullName: "Paola Herrera",
    cedula: "0987654321",
    phone: "0956781234",
    email: "paola.herrera@gmail.com",
    address: "Sector Kennedy, Guayaquil",
    source: "CLIENTE_DIRECTO",
    createdAt: new Date("2024-06-03T15:50:00"),
    updatedAt: new Date("2024-06-03T15:50:00"),
    createdBy: mockAdmin.id,
  },
  {
    id: "client-006",
    fullName: "Gabriela Ponce",
    cedula: "1123456709",
    phone: "0934567812",
    // sin email
    address: "Cumbayá, Quito",
    source: "PUBLICIDAD",
    createdAt: new Date("2024-06-10T10:10:00"),
    updatedAt: new Date("2024-06-10T10:10:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-007",
    fullName: "Valentina Cedeño",
    cedula: "1345678902",
    phone: "0967891234",
    email: "valen.cedeno@outlook.com",
    // sin dirección
    source: "INSTAGRAM",
    createdAt: new Date("2024-06-15T12:00:00"),
    updatedAt: new Date("2024-06-15T12:00:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-008",
    fullName: "Andrea Zambrano",
    cedula: "1298765430",
    phone: "0923456781",
    // sin email
    // sin dirección
    source: "OTRO",
    createdAt: new Date("2024-06-18T17:30:00"),
    updatedAt: new Date("2024-06-18T17:30:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-009",
    fullName: "Melissa Vera",
    cedula: "0934567821",
    phone: "0978123456",
    email: "melissa.vera21@gmail.com",
    address: "Av. 9 de Octubre, Guayaquil",
    source: "FACEBOOK",
    createdAt: new Date("2024-06-22T09:45:00"),
    updatedAt: new Date("2024-06-22T09:45:00"),
    createdBy: mockAdmin.id,
  },
  {
    id: "client-010",
    fullName: "Carolina Suárez",
    cedula: "1187654320",
    phone: "0989123456",
    // sin email
    address: "Av. Naciones Unidas, Quito",
    source: "REFERIDO",
    createdAt: new Date("2024-06-25T14:15:00"),
    updatedAt: new Date("2024-06-25T14:15:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-011",
    fullName: "Fernanda Ortiz",
    cedula: "0912345670",
    phone: "0941237890",
    email: "fer.ortiz@gmail.com",
    // sin dirección
    source: "TIKTOK",
    createdAt: new Date("2024-07-02T11:00:00"),
    updatedAt: new Date("2024-07-02T11:00:00"),
    createdBy: mockVendedor.id,
  },
  {
    id: "client-012",
    fullName: "Nicole Salazar",
    cedula: "1276543210",
    phone: "0952348761",
    // sin email
    // sin dirección
    source: "CLIENTE_DIRECTO",
    createdAt: new Date("2024-07-05T18:20:00"),
    updatedAt: new Date("2024-07-05T18:20:00"),
    createdBy: mockVendedor.id,
  },
];
