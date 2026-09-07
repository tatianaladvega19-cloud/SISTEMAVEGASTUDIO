"use client";

// Tarjeta "Gestión de datos" de /configuracion. Todavía no hay backend
// ni almacenamiento de archivos, así que ninguna acción exporta datos
// de verdad: solo confirma visualmente que la función quedará
// disponible cuando el sistema se conecte a Supabase.

import { useEffect, useState } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";

interface DataAction {
  id: string;
  label: string;
  description: string;
}

const ACTIONS: DataAction[] = [
  {
    id: "export-clients",
    label: "Exportar clientes",
    description: "Descarga el listado completo de clientes registrados.",
  },
  {
    id: "export-sales",
    label: "Exportar ventas",
    description: "Descarga el historial de ventas del sistema.",
  },
  {
    id: "backup",
    label: "Crear copia de seguridad",
    description: "Genera un respaldo de toda la información del negocio.",
  },
];

const NOTICE_TIMEOUT_MS = 4000;

export default function DataManagement() {
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeActionId) return;
    const timeout = setTimeout(() => setActiveActionId(null), NOTICE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [activeActionId]);

  return (
    <DashboardCard title="Gestión de datos">
      <p className="-mt-2 mb-4 text-sm text-muted">
        Administra y prepara la información del sistema.
      </p>

      <div className="space-y-3">
        {ACTIONS.map((action) => (
          <div
            key={action.id}
            className="rounded-lg border border-line bg-background/60 p-3.5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{action.label}</p>
                <p className="mt-0.5 text-xs text-muted">{action.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveActionId(action.id)}
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-background"
              >
                {action.label}
              </button>
            </div>

            {activeActionId === action.id && (
              <p className="mt-3 rounded-md bg-accent-soft px-3 py-2 text-xs font-medium text-accent">
                Esta función estará disponible cuando el sistema esté
                conectado a la base de datos.
              </p>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
