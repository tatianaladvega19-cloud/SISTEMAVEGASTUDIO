// Datos de ejemplo (mock) de profesionales/empleadas de VEGA STUDIO.
// Igual que las categorías de servicio, no se hardcodean en la lógica de
// ningún componente: son datos administrables (ver
// lib/data/professionals-store.ts) para que más adelante puedan
// agregarse, editarse o desactivarse desde Administración.

import { Professional } from "../types";

export const profCamila: Professional = {
  id: "prof-camila",
  name: "Camila",
  isActive: true,
  createdAt: new Date("2024-01-08T08:00:00"),
  updatedAt: new Date("2024-01-08T08:00:00"),
};

export const profLupita: Professional = {
  id: "prof-lupita",
  name: "Lupita",
  isActive: true,
  createdAt: new Date("2024-01-08T08:05:00"),
  updatedAt: new Date("2024-01-08T08:05:00"),
};

export const profVanessa: Professional = {
  id: "prof-vanessa",
  name: "Vanessa",
  isActive: true,
  createdAt: new Date("2024-01-08T08:10:00"),
  updatedAt: new Date("2024-01-08T08:10:00"),
};

export const mockProfessionals: Professional[] = [
  profCamila,
  profLupita,
  profVanessa,
];
