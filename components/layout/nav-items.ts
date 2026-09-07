// Fuente única de verdad para la navegación administrativa: Sidebar la
// usa para pintar el menú y Topbar la usa para resolver el título
// dinámico de cada página a partir de la ruta activa.
//
// `isVisible` reutiliza la matriz de permisos existente en
// lib/permissions.ts (no define reglas nuevas): si se omite, el ítem
// es visible para cualquier rol con sesión iniciada.

import type { ComponentType } from "react";
import type { Permisos } from "@/lib/permissions";
import {
  IconDashboard,
  IconClients,
  IconServices,
  IconSales,
  IconReports,
  IconUsers,
  IconSettings,
} from "./icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isVisible?: (permisos: Permisos) => boolean;
}

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
  {
    label: "Clientes",
    href: "/clientes",
    icon: IconClients,
    isVisible: (p) => p.clientes.ver,
  },
  {
    label: "Servicios",
    href: "/servicios",
    icon: IconServices,
    isVisible: (p) => p.servicios.administrar,
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: IconSales,
    isVisible: (p) => p.ventas.registrar,
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: IconReports,
    isVisible: (p) => p.reportes.ver,
  },
];

export const adminNavItems: NavItem[] = [
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: IconUsers,
    isVisible: (p) => p.usuarios.administrar,
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: IconSettings,
    isVisible: (p) => p.configuracion.administrar,
  },
];

// No aparece en Sidebar (se accede desde el avatar/nombre en Sidebar y
// Topbar), pero sí debe resolver el título de página en Topbar.
export const secondaryNavItems: NavItem[] = [
  { label: "Mi perfil", href: "/perfil", icon: IconUsers },
];

export const allNavItems: NavItem[] = [
  ...mainNavItems,
  ...adminNavItems,
  ...secondaryNavItems,
];

export function getVisibleNavItems(
  items: NavItem[],
  permisos: Permisos
): NavItem[] {
  return items.filter((item) => !item.isVisible || item.isVisible(permisos));
}
