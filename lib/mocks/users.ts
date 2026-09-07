// Datos de ejemplo (mock) de usuarios de VEGA STUDIO.
// No provienen de ninguna base de datos: son solo objetos en memoria
// para poder construir y previsualizar pantallas antes de conectar el
// backend real.

import { User } from "../types";

export const mockAdmin: User = {
  id: "user-admin-1",
  name: "Vanessa Vega",
  username: "vanessa.vega",
  email: "vanessa@vegastudio.com",
  role: "ADMIN",
  isActive: true,
  createdAt: new Date("2024-01-10T09:00:00"),
  updatedAt: new Date("2024-01-10T09:00:00"),
};

export const mockVendedor: User = {
  id: "user-vendedor-1",
  name: "Camila Torres",
  username: "camila.torres",
  email: "camila.torres@vegastudio.com",
  role: "VENDEDOR",
  isActive: true,
  createdAt: new Date("2024-02-01T10:30:00"),
  updatedAt: new Date("2024-02-01T10:30:00"),
};

export const mockUsers: User[] = [mockAdmin, mockVendedor];
