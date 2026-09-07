// Tarjeta compacta "Información del sistema" de /configuracion.
// Puramente informativa: versión y estado se leen del código, no de
// datos del usuario, así que no necesita ser un client component.

const APP_VERSION = "0.1.0";
const APP_STATUS = "Desarrollo";

export default function SystemInfo() {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-sm font-semibold text-ink">VEGA STUDIO</p>
          <p className="text-xs text-muted">Sistema de gestión</p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-muted">Versión</p>
            <p className="text-sm font-medium text-ink">{APP_VERSION}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Estado</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {APP_STATUS}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
