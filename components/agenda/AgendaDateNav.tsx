"use client";

import { formatWeekRangeLabel, isCurrentWeek } from "@/lib/utils/agenda";

interface AgendaDateNavProps {
  weekStart: string;
  weekDates: string[];
  onJumpToDate: (date: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function AgendaDateNav({
  weekStart,
  weekDates,
  onJumpToDate,
  onPrevious,
  onNext,
  onToday,
}: AgendaDateNavProps) {
  const currentWeek = isCurrentWeek(weekStart);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Semana anterior"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:bg-background"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M14.5 5.5 8 12l6.5 6.5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToday}
          disabled={currentWeek}
          className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hoy
        </button>

        <button
          type="button"
          onClick={onNext}
          aria-label="Semana siguiente"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-colors hover:bg-background"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M9.5 5.5 16 12l-6.5 6.5" />
          </svg>
        </button>

        <div className="ml-2 flex items-center gap-2">
          <p className="text-sm font-medium text-ink">
            {formatWeekRangeLabel(weekDates)}
          </p>
          {currentWeek && (
            <span className="inline-flex shrink-0 items-center rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              Semana actual
            </span>
          )}
        </div>
      </div>

      <input
        type="date"
        value={weekStart}
        onChange={(event) => onJumpToDate(event.target.value)}
        aria-label="Ir a la semana que contiene esta fecha"
        className="rounded-lg border border-line bg-background px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
