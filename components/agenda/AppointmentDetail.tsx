"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCheck } from "@/components/layout/icons";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import { formatAgendaDate } from "@/lib/utils/agenda";
import {
  formatDuration,
  formatReminderRecipient,
  formatReminderStatus,
  formatReminderTiming,
} from "@/lib/utils/format";
import type { Appointment } from "@/lib/types";

interface AppointmentDetailProps {
  appointment: Appointment;
  /** true mientras un Server Action está en curso (editar/cancelar). */
  disabled?: boolean;
  onEdit: () => void;
  onCancelAppointment: () => void;
}

export default function AppointmentDetail({
  appointment,
  disabled = false,
  onEdit,
  onCancelAppointment,
}: AppointmentDetailProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isCancelled = appointment.status === "CANCELADA";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-ink">
            {appointment.clientName}
          </h3>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
        <p className="mt-1 text-sm text-muted">{appointment.serviceName}</p>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-background/60 p-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            Profesional
          </dt>
          <dd className="mt-1 font-medium text-ink">
            {appointment.professionalName}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Fecha</dt>
          <dd className="mt-1 font-medium text-ink">
            {formatAgendaDate(appointment.date)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Hora</dt>
          <dd className="mt-1 font-medium text-ink">{appointment.time}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">
            Duración
          </dt>
          <dd className="mt-1 font-medium text-ink">
            {formatDuration(appointment.duration)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Estado</dt>
          <dd className="mt-1">
            <AppointmentStatusBadge status={appointment.status} />
          </dd>
        </div>
      </dl>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Notas
        </h4>
        <p className="mt-1.5 text-sm text-ink">
          {appointment.notes || "Sin notas."}
        </p>
      </div>

      <div className="rounded-xl border border-line bg-background/60 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Recordatorios
        </h4>
        <ul className="mt-3 space-y-2">
          {appointment.reminders.map((reminder) => (
            <li
              key={reminder.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-2 text-ink">
                <IconCheck className="h-4 w-4 text-accent" />
                {formatReminderTiming(reminder.timing)} ·{" "}
                {formatReminderRecipient(reminder.recipientRole)}
              </span>
              <span
                className={`text-xs font-medium ${
                  reminder.status === "ENVIADA" || reminder.status === "PROGRAMADA"
                    ? "text-emerald-700"
                    : reminder.status === "FALLIDA"
                      ? "text-red-600"
                      : "text-muted"
                }`}
              >
                {formatReminderStatus(reminder.status)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Los recordatorios de la clienta se envían automáticamente por
          WhatsApp (Twilio). Los de la administradora todavía no están
          conectados.
        </p>
      </div>

      <NotificationStatusSection appointment={appointment} />

      {isCancelled ? (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Esta cita fue cancelada.
        </div>
      ) : confirmingCancel ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            ¿Seguro que quieres cancelar esta cita?
          </p>
          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmingCancel(false)}
              disabled={disabled}
              className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              No, mantener
            </button>
            <button
              type="button"
              onClick={onCancelAppointment}
              disabled={disabled}
              className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {disabled ? "Cancelando..." : "Sí, cancelar"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/clientes/${appointment.clientId}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-background"
          >
            Ver cliente
          </Link>
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Editar cita
          </button>
          <button
            type="button"
            onClick={() => setConfirmingCancel(true)}
            disabled={disabled}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar cita
          </button>
        </div>
      )}
    </div>
  );
}

// Sección "NOTIFICACIONES" (PASO 21 del sistema de notificaciones):
// resume, de forma discreta, si el WhatsApp de confirmación a la
// clienta, el aviso a la administradora y los recordatorios 24h/1h de
// la clienta se enviaron/programaron correctamente. Reutiliza los
// mismos tokens de color que el resto del panel (emerald/red/muted),
// sin introducir estilos nuevos.
function NotificationStatusSection({ appointment }: { appointment: Appointment }) {
  const reminder24h = appointment.reminders.find(
    (reminder) => reminder.recipientRole === "CLIENTA" && reminder.timing === "24H_ANTES"
  );
  const reminder1h = appointment.reminders.find(
    (reminder) => reminder.recipientRole === "CLIENTA" && reminder.timing === "1H_ANTES"
  );

  const rows: Array<{ label: string; status?: string }> = [
    { label: "WhatsApp clienta", status: appointment.confirmationStatus },
    { label: "WhatsApp administración", status: appointment.adminNotificationStatus },
    { label: "Recordatorio 24 h", status: reminder24h?.status },
    { label: "Recordatorio 1 h", status: reminder1h?.status },
  ];

  return (
    <div className="rounded-xl border border-line bg-background/60 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
        Notificaciones
      </h4>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink">{row.label}</span>
            <NotificationStatusPill status={row.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotificationStatusPill({ status }: { status?: string }) {
  if (status === "ENVIADA") {
    return <span className="text-xs font-medium text-emerald-700">✓ Enviado</span>;
  }
  if (status === "PROGRAMADA") {
    return <span className="text-xs font-medium text-emerald-700">✓ Programado</span>;
  }
  if (status === "FALLIDA") {
    return <span className="text-xs font-medium text-red-600">⚠ No enviado</span>;
  }
  if (status === "CANCELADA") {
    return <span className="text-xs font-medium text-muted">Cancelado</span>;
  }
  return <span className="text-xs font-medium text-muted">Pendiente</span>;
}
