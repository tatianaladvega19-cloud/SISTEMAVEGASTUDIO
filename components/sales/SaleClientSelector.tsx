"use client";

import { useMemo, useState } from "react";
import { IconClose } from "@/components/layout/icons";
import { searchClients } from "@/lib/utils/clients";
import { formatClientSource } from "@/lib/utils/format";
import type { Client } from "@/lib/types";

interface SaleClientSelectorProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelect: (client: Client) => void;
  onClear: () => void;
  error?: string;
}

const MAX_VISIBLE_RESULTS = 6;

export default function SaleClientSelector({
  clients,
  selectedClient,
  onSelect,
  onClear,
  error,
}: SaleClientSelectorProps) {
  const [search, setSearch] = useState("");

  const results = useMemo(
    () => searchClients(clients, search).slice(0, MAX_VISIBLE_RESULTS),
    [clients, search]
  );

  if (selectedClient) {
    return (
      <div className="rounded-lg border border-line bg-background p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {selectedClient.fullName}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {selectedClient.cedula} · {selectedClient.phone}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              {formatClientSource(selectedClient.source)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-lg border border-line bg-surface p-1.5 text-muted transition-colors hover:text-ink"
            aria-label="Quitar cliente seleccionado"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-sm font-medium text-accent hover:underline"
        >
          Cambiar cliente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.3" y1="15.3" x2="20" y2="20" />
        </svg>
        <input
          type="text"
          inputMode="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, cédula o teléfono..."
          className={`w-full rounded-lg border bg-background px-3.5 py-2.5 pl-10 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              : "border-line focus:border-accent focus:ring-accent/20"
          }`}
        />
      </div>

      <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
        {results.length === 0 && (
          <p className="px-1 py-2 text-sm text-muted">
            No se encontraron clientes con ese criterio.
          </p>
        )}
        {results.map((client) => (
          <button
            key={client.id}
            type="button"
            onClick={() => {
              onSelect(client);
              setSearch("");
            }}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-left transition-colors hover:border-accent/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {client.fullName}
              </p>
              <p className="text-xs text-muted">
                {client.cedula} · {client.phone}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-accent">
              Seleccionar
            </span>
          </button>
        ))}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
