// Datos de ejemplo (mock) de servicios de VEGA STUDIO.
// Precios en USD. "svc-micro-labios-perfilado" queda inactivo a
// propósito, para representar un servicio descontinuado que igual
// puede aparecer referenciado en ventas históricas (ver sales.ts).

import { Service } from "../types";
import {
  catPestanas,
  catMicroCejas,
  catMicroLabios,
  catColorTintes,
  catMaquillaje,
} from "./service-categories";

export const mockServices: Service[] = [
  // Pestañas
  {
    id: "svc-pestanas-lifting",
    name: "Lifting de pestañas",
    categoryId: catPestanas.id,
    description: "Curvado y tinte de pestañas naturales.",
    price: 25,
    isActive: true,
    createdAt: new Date("2024-01-06T09:00:00"),
    updatedAt: new Date("2024-01-06T09:00:00"),
  },
  {
    id: "svc-pestanas-clasicas",
    name: "Extensión de pestañas clásicas",
    categoryId: catPestanas.id,
    description: "Aplicación pelo a pelo.",
    price: 35,
    isActive: true,
    createdAt: new Date("2024-01-06T09:05:00"),
    updatedAt: new Date("2024-01-06T09:05:00"),
  },
  {
    id: "svc-pestanas-volumen-ruso",
    name: "Extensión de pestañas volumen ruso",
    categoryId: catPestanas.id,
    description: "Técnica de abanicos para mayor volumen.",
    price: 45,
    isActive: true,
    createdAt: new Date("2024-01-06T09:10:00"),
    updatedAt: new Date("2024-01-06T09:10:00"),
  },

  // Micropigmentación de cejas
  {
    id: "svc-cejas-microblading",
    name: "Microblading de cejas",
    categoryId: catMicroCejas.id,
    description: "Técnica manual de pelo a pelo.",
    price: 120,
    isActive: true,
    createdAt: new Date("2024-01-06T09:15:00"),
    updatedAt: new Date("2024-01-06T09:15:00"),
  },
  {
    id: "svc-cejas-diseno-henna",
    name: "Diseño y henna de cejas",
    categoryId: catMicroCejas.id,
    description: "Diseño temporal con henna.",
    price: 20,
    isActive: true,
    createdAt: new Date("2024-01-06T09:20:00"),
    updatedAt: new Date("2024-01-06T09:20:00"),
  },
  {
    id: "svc-cejas-retoque",
    name: "Retoque de micropigmentación de cejas",
    categoryId: catMicroCejas.id,
    description: "Retoque de color a los 30-45 días.",
    price: 60,
    isActive: true,
    createdAt: new Date("2024-01-06T09:25:00"),
    updatedAt: new Date("2024-01-06T09:25:00"),
  },

  // Micropigmentación de labios
  {
    id: "svc-labios-micropigmentacion",
    name: "Micropigmentación de labios",
    categoryId: catMicroLabios.id,
    description: "Aplicación de pigmento en labios.",
    price: 150,
    isActive: true,
    createdAt: new Date("2024-01-06T09:30:00"),
    updatedAt: new Date("2024-01-06T09:30:00"),
  },
  {
    id: "svc-micro-labios-perfilado",
    name: "Perfilado de labios",
    categoryId: catMicroLabios.id,
    description: "Perfilado sin pigmentación permanente.",
    price: 40,
    // Servicio descontinuado; se mantiene en el catálogo (isActive:
    // false) porque quedó referenciado en ventas históricas.
    isActive: false,
    createdAt: new Date("2024-01-06T09:35:00"),
    updatedAt: new Date("2024-06-01T12:00:00"),
  },
  {
    id: "svc-labios-retoque",
    name: "Retoque de micropigmentación de labios",
    categoryId: catMicroLabios.id,
    description: "Retoque de color a los 30-45 días.",
    price: 70,
    isActive: true,
    createdAt: new Date("2024-01-06T09:40:00"),
    updatedAt: new Date("2024-01-06T09:40:00"),
  },

  // Colorización y tintes
  {
    id: "svc-color-tinte-completo",
    name: "Tinte completo",
    categoryId: catColorTintes.id,
    description: "Aplicación de color en todo el cabello.",
    price: 45,
    isActive: true,
    createdAt: new Date("2024-01-06T09:45:00"),
    updatedAt: new Date("2024-01-06T09:45:00"),
  },
  {
    id: "svc-color-balayage",
    name: "Balayage",
    categoryId: catColorTintes.id,
    description: "Técnica de iluminación degradada.",
    price: 90,
    isActive: true,
    createdAt: new Date("2024-01-06T09:50:00"),
    updatedAt: new Date("2024-07-01T10:00:00"),
  },
  {
    id: "svc-color-retoque-raiz",
    name: "Retoque de raíz",
    categoryId: catColorTintes.id,
    description: "Cobertura de canas y crecimiento.",
    price: 30,
    isActive: true,
    createdAt: new Date("2024-01-06T09:55:00"),
    updatedAt: new Date("2024-01-06T09:55:00"),
  },

  // Maquillaje
  {
    id: "svc-maquillaje-social",
    name: "Maquillaje social",
    categoryId: catMaquillaje.id,
    description: "Maquillaje para eventos y salidas.",
    price: 35,
    isActive: true,
    createdAt: new Date("2024-01-06T10:00:00"),
    updatedAt: new Date("2024-01-06T10:00:00"),
  },
  {
    id: "svc-maquillaje-novia",
    name: "Maquillaje de novia",
    categoryId: catMaquillaje.id,
    description: "Incluye prueba previa.",
    price: 120,
    isActive: true,
    createdAt: new Date("2024-01-06T10:05:00"),
    updatedAt: new Date("2024-01-06T10:05:00"),
  },
  {
    id: "svc-maquillaje-sesion-fotos",
    name: "Maquillaje para sesión de fotos",
    categoryId: catMaquillaje.id,
    description: "Maquillaje de larga duración para fotografía.",
    price: 50,
    isActive: true,
    createdAt: new Date("2024-01-06T10:10:00"),
    updatedAt: new Date("2024-01-06T10:10:00"),
  },
];
