"use client";

import { useMemo, useState } from "react";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import {
  WEEKDAY_LABELS,
  WEEKDAY_LABELS_LONG,
  isToday,
  parseISODate,
} from "@/lib/utils/agenda";
import type { AgendaCell, AgendaWeekRow } from "@/lib/utils/agenda";
import type { Appointment } from "@/lib/types";

interface AgendaTableProps {
  rows: AgendaWeekRow[];
  weekDates: string[];
  /** Muestra el nombre de la profesional en cada cita (vista "Todas"). */
  showProfessional: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
  onEmptyClick: (date: string, time: string) => void;
}

function dayNumber(date: string): number {
  return parseISODate(date).getDate();
}

// Botón compacto de una cita dentro de una celda ocupada (verde). Una
// celda puede tener más de una cita (vista "Todas" con varias
// profesionales a la misma hora), así que cada cita es su propio botón
// en vez de que la celda entera abra un solo detalle. Solo la franja de
// INICIO de la cita muestra el detalle completo; las franjas que solo
// están cubiertas por su duración muestran un indicador reducido para
// no duplicar la información (ver lib/utils/agenda.ts, sección 18/20).
function AppointmentChip({
  appointment,
  showProfessional,
  isStart,
  onClick,
}: {
  appointment: Appointment;
  showProfessional: boolean;
  isStart: boolean;
  onClick: () => void;
}) {
  if (!isStart) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full min-w-0 cursor-pointer rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-occupied-hover"
      >
        <p className="truncate text-[11px] font-medium text-occupied-strong">
          Ocupado{showProfessional ? ` · ${appointment.professionalName}` : ""}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-w-0 cursor-pointer space-y-1 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-occupied-hover"
    >
      <p className="truncate text-xs font-semibold text-ink">
        {appointment.clientName}
      </p>
      <p className="truncate text-[11px] text-ink/70">{appointment.serviceName}</p>
      {showProfessional && (
        <p className="truncate text-[11px] font-medium text-occupied-strong">
          {appointment.professionalName}
        </p>
      )}
      <p className="truncate text-[11px] text-muted">{appointment.duration} min</p>
      <AppointmentStatusBadge status={appointment.status} />
    </button>
  );
}

// Contenido de una celda: disponible (abre "Nueva cita") o una o más
// citas compactas. Se usa tanto en la cuadrícula de escritorio/tablet
// como en el listado de un solo día para móvil.
function CellContent({
  cell,
  showProfessional,
  onAppointmentClick,
  onEmptyClick,
}: {
  cell: AgendaCell;
  showProfessional: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
  onEmptyClick: () => void;
}) {
  if (cell.appointments.length === 0) {
    return (
      <button
        type="button"
        onClick={onEmptyClick}
        className="group flex h-full min-h-[44px] w-full cursor-pointer items-center justify-center"
      >
        <span className="text-xs text-muted transition-colors group-hover:text-accent">
          Disponible
        </span>
      </button>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col divide-y divide-occupied-border/60">
      {cell.appointments.map((appointment) => (
        <AppointmentChip
          key={appointment.id}
          appointment={appointment}
          showProfessional={showProfessional}
          isStart={appointment.time === cell.time}
          onClick={() => onAppointmentClick(appointment)}
        />
      ))}
    </div>
  );
}

export default function AgendaTable({
  rows,
  weekDates,
  showProfessional,
  onAppointmentClick,
  onEmptyClick,
}: AgendaTableProps) {
  const [mobileDayIndex, setMobileDayIndex] = useState(() => {
    const todayIndex = weekDates.findIndex((date) => isToday(date));
    return todayIndex === -1 ? 0 : todayIndex;
  });

  const safeMobileDayIndex = mobileDayIndex < weekDates.length ? mobileDayIndex : 0;

  const mobileRows = useMemo(
    () =>
      rows.map((row) => ({
        time: row.time,
        cell: row.cells[safeMobileDayIndex],
      })),
    [rows, safeMobileDayIndex]
  );

  return (
    <div>
      {/* Escritorio / tablet: cuadrícula semanal completa, sin scroll horizontal. */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-surface md:block">
        <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
          <div className="border-b border-r border-line bg-background/60 px-2 py-3 text-xs font-medium uppercase tracking-wide text-muted">
            Hora
          </div>
          {weekDates.map((date, index) => {
            const today = isToday(date);
            return (
              <div
                key={date}
                className={`border-b border-line px-2 py-3 text-center text-xs font-medium uppercase tracking-wide last:border-r-0 ${
                  index < 6 ? "border-r" : ""
                } ${today ? "bg-accent-soft text-accent" : "bg-background/60 text-muted"}`}
              >
                <div>{WEEKDAY_LABELS[index]}</div>
                <div
                  className={`mt-0.5 text-sm normal-case ${
                    today ? "font-semibold text-accent" : "font-medium text-ink"
                  }`}
                >
                  {dayNumber(date)}
                </div>
              </div>
            );
          })}

          {rows.map((row) => (
            <div key={row.time} className="contents">
              <div className="flex items-start border-b border-r border-line bg-background/40 px-2 py-2 text-xs font-medium text-ink">
                {row.time}
              </div>
              {row.cells.map((cell, index) => {
                const today = isToday(cell.date);
                const occupied = cell.appointments.length > 0;
                return (
                  <div
                    key={`${cell.date}-${cell.time}`}
                    className={`flex min-h-[76px] items-center justify-center border-b border-line px-2 py-2 last:border-r-0 ${
                      index < 6 ? "border-r" : ""
                    } ${
                      occupied
                        ? "bg-occupied"
                        : today
                          ? "bg-accent-soft/10 hover:bg-accent-soft/30"
                          : "hover:bg-accent-soft/30"
                    }`}
                  >
                    <CellContent
                      cell={cell}
                      showProfessional={showProfessional}
                      onAppointmentClick={onAppointmentClick}
                      onEmptyClick={() => onEmptyClick(cell.date, cell.time)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Móvil: no caben 7 columnas, se navega un día a la vez con tabs. */}
      <div className="md:hidden">
        <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-line bg-surface p-1.5">
          {weekDates.map((date, index) => {
            const today = isToday(date);
            const selected = index === safeMobileDayIndex;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setMobileDayIndex(index)}
                className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "bg-ink text-white"
                    : today
                      ? "bg-accent-soft text-accent"
                      : "text-muted hover:bg-background"
                }`}
              >
                <span className="uppercase">{WEEKDAY_LABELS[index]}</span>
                <span className="mt-0.5 text-sm">{dayNumber(date)}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-sm font-medium text-ink">
          {WEEKDAY_LABELS_LONG[safeMobileDayIndex]}
        </p>

        <div className="mt-2 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="divide-y divide-line">
            {mobileRows.map(({ time, cell }) => (
              <div
                key={time}
                className={`grid w-full grid-cols-[64px_1fr] items-center gap-2 px-4 py-3 ${
                  cell.appointments.length > 0 ? "bg-occupied" : ""
                }`}
              >
                <span className="text-sm font-medium text-ink">{time}</span>
                <CellContent
                  cell={cell}
                  showProfessional={showProfessional}
                  onAppointmentClick={onAppointmentClick}
                  onEmptyClick={() => onEmptyClick(cell.date, cell.time)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
