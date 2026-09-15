"use client";

// Centro de notificaciones interno de VEGA STUDIO (PASO 14/15). Vive en
// el Topbar (visible en todas las páginas del dashboard, no solo en
// Agenda) y muestra las alertas creadas por
// lib/notifications/appointment-notifications.ts al crear/reprogramar/
// cancelar citas y al enviar/fallar un WhatsApp. Sondea el servidor
// cada 20s para que el contador de no leídas se mantenga razonablemente
// al día sin necesidad de un mecanismo de tiempo real.

import { useCallback, useEffect, useRef, useState } from "react";
import { IconBell } from "@/components/layout/icons";
import { formatRelativeTime } from "@/lib/utils/format";
import {
  getAlertsSummaryAction,
  markAllAlertsReadAction,
} from "@/lib/notifications/alerts-actions";
import type { InternalAlert } from "@/lib/types";

const POLL_INTERVAL_MS = 20000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<InternalAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const summary = await getAlertsSummaryAction();
    setAlerts(summary.alerts);
    setUnreadCount(summary.unreadCount);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) await refresh();
  }

  async function handleMarkAllRead() {
    const summary = await markAllAlertsReadAction();
    setAlerts(summary.alerts);
    setUnreadCount(summary.unreadCount);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notificaciones"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-black/5"
      >
        <IconBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                {unreadCount} sin leer
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">
                No hay notificaciones todavía.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {alerts.map((alert) => (
                  <li key={alert.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink">{alert.title}</p>
                      {!alert.read && (
                        <span
                          aria-hidden="true"
                          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{alert.message}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatRelativeTime(alert.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-line px-4 py-2.5">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="w-full rounded-lg py-1.5 text-center text-sm font-medium text-accent transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
