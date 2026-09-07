"use client";

// Tarjeta "Preferencias del sistema" de /configuracion. Todo vive en
// estado local por ahora; cuando exista Supabase, estos valores deben
// leerse/guardarse en la fila de preferencias del usuario o del
// negocio en vez de inicializarse con las constantes de abajo.

import { useState } from "react";
import { fieldControlClass } from "@/components/clients/FormField";
import DashboardCard from "@/components/dashboard/DashboardCard";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "DOP", label: "DOP (RD$)" },
  { value: "EUR", label: "EUR (€)" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/AAAA", label: "DD/MM/AAAA" },
  { value: "MM/DD/AAAA", label: "MM/DD/AAAA" },
  { value: "AAAA-MM-DD", label: "AAAA-MM-DD" },
];

const TIMEZONE_OPTIONS = [
  { value: "America/Santo_Domingo", label: "Santo Domingo (GMT-4)" },
  { value: "America/New_York", label: "Nueva York (GMT-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
];

export default function SystemPreferences() {
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0].value);
  const [dateFormat, setDateFormat] = useState(DATE_FORMAT_OPTIONS[0].value);
  const [timezone, setTimezone] = useState(TIMEZONE_OPTIONS[0].value);
  const [confirmActions, setConfirmActions] = useState(true);

  return (
    <DashboardCard title="Preferencias del sistema">
      <p className="-mt-2 mb-4 text-sm text-muted">
        Personaliza cómo se muestran los datos dentro del sistema.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="pref-currency" className="text-sm font-medium text-ink">
            Moneda
          </label>
          <select
            id="pref-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className={`mt-1.5 ${fieldControlClass()}`}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pref-date-format" className="text-sm font-medium text-ink">
            Formato de fecha
          </label>
          <select
            id="pref-date-format"
            value={dateFormat}
            onChange={(event) => setDateFormat(event.target.value)}
            className={`mt-1.5 ${fieldControlClass()}`}
          >
            {DATE_FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pref-timezone" className="text-sm font-medium text-ink">
            Zona horaria
          </label>
          <select
            id="pref-timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className={`mt-1.5 ${fieldControlClass()}`}
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-line bg-background/60 p-3.5">
          <div>
            <p className="text-sm font-medium text-ink">
              Confirmar acciones importantes
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Solicita confirmación antes de realizar acciones que puedan
              afectar los datos.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={confirmActions}
            aria-label="Confirmar acciones importantes"
            onClick={() => setConfirmActions((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              confirmActions ? "bg-accent" : "bg-line"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                confirmActions ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}
