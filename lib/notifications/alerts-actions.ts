"use server";

// Server Actions que alimentan el centro de notificaciones interno
// (components/notifications/NotificationBell.tsx). Separado de
// app/(dashboard)/agenda/actions.ts porque el centro de notificaciones
// es visible en todas las páginas del dashboard (vive en Topbar), no
// solo en Agenda.

import {
  getRecentAlerts,
  getUnreadAlertsCount,
  markAlertRead,
  markAllAlertsRead,
} from "@/lib/data/alerts-store";
import type { InternalAlert } from "@/lib/types";

const RECENT_ALERTS_LIMIT = 15;

export interface AlertsSummary {
  alerts: InternalAlert[];
  unreadCount: number;
}

export async function getAlertsSummaryAction(): Promise<AlertsSummary> {
  const [alerts, unreadCount] = await Promise.all([
    getRecentAlerts(RECENT_ALERTS_LIMIT),
    getUnreadAlertsCount(),
  ]);
  return { alerts, unreadCount };
}

export async function markAlertReadAction(id: string): Promise<AlertsSummary> {
  await markAlertRead(id);
  return getAlertsSummaryAction();
}

export async function markAllAlertsReadAction(): Promise<AlertsSummary> {
  await markAllAlertsRead();
  return getAlertsSummaryAction();
}
