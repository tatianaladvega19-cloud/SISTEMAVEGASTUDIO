// Datos de ejemplo (mock) de categorías de servicio de VEGA STUDIO.
// En el sistema real estas categorías se crean y administran desde el
// panel Admin; aquí solo se representan como datos, no están
// hardcodeadas en el modelo (lib/types.ts).

import { ServiceCategory } from "../types";

export const catPestanas: ServiceCategory = {
  id: "cat-pestanas",
  name: "Pestañas",
  description: "Extensión, lifting y tratamientos de pestañas.",
  isActive: true,
  createdAt: new Date("2024-01-05T08:00:00"),
  updatedAt: new Date("2024-01-05T08:00:00"),
};

export const catMicroCejas: ServiceCategory = {
  id: "cat-micro-cejas",
  name: "Micropigmentación de cejas",
  description: "Diseño y micropigmentación semipermanente de cejas.",
  isActive: true,
  createdAt: new Date("2024-01-05T08:05:00"),
  updatedAt: new Date("2024-01-05T08:05:00"),
};

export const catMicroLabios: ServiceCategory = {
  id: "cat-micro-labios",
  name: "Micropigmentación de labios",
  description: "Micropigmentación y perfilado de labios.",
  isActive: true,
  createdAt: new Date("2024-01-05T08:10:00"),
  updatedAt: new Date("2024-01-05T08:10:00"),
};

export const catColorTintes: ServiceCategory = {
  id: "cat-color-tintes",
  name: "Colorización y tintes",
  description: "Coloración, tintes y tratamientos capilares.",
  isActive: true,
  createdAt: new Date("2024-01-05T08:15:00"),
  updatedAt: new Date("2024-01-05T08:15:00"),
};

export const catMaquillaje: ServiceCategory = {
  id: "cat-maquillaje",
  name: "Maquillaje",
  description: "Maquillaje social, novias y eventos.",
  isActive: true,
  createdAt: new Date("2024-01-05T08:20:00"),
  updatedAt: new Date("2024-01-05T08:20:00"),
};

export const mockServiceCategories: ServiceCategory[] = [
  catPestanas,
  catMicroCejas,
  catMicroLabios,
  catColorTintes,
  catMaquillaje,
];
