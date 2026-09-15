"use client";

import { IconClose } from "@/components/layout/icons";

interface AppointmentPanelProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Panel lateral deslizable desde la derecha, reutilizado tanto para
// "Nueva cita" como para "Detalle de cita" (AgendaExplorer decide qué
// contenido mostrar). Mismo mecanismo de overlay + transform que usa
// el drawer móvil de components/layout/Sidebar.tsx, pero anclado a la
// derecha y disponible en cualquier tamaño de pantalla.
export default function AppointmentPanel({
  open,
  title,
  description,
  onClose,
  children,
}: AppointmentPanelProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-ink"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {open ? children : null}
        </div>
      </aside>
    </>
  );
}
