"use client";

// Selector de profesional de Agenda: "Todas" + una opción por cada
// profesional activa. Mismo patrón visual de pastillas que
// components/services/ServiceFilters.tsx (bg-ink en la opción activa).

import type { Professional } from "@/lib/types";
import { ALL_PROFESSIONALS_FILTER } from "@/lib/utils/professionals";

interface ProfessionalFilterProps {
  professionals: Professional[];
  value: string;
  onChange: (value: string) => void;
}

export default function ProfessionalFilter({
  professionals,
  value,
  onChange,
}: ProfessionalFilterProps) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1">
      <button
        type="button"
        onClick={() => onChange(ALL_PROFESSIONALS_FILTER)}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          value === ALL_PROFESSIONALS_FILTER
            ? "bg-ink text-white"
            : "text-muted hover:text-ink"
        }`}
      >
        Todas
      </button>
      {professionals.map((professional) => (
        <button
          key={professional.id}
          type="button"
          onClick={() => onChange(professional.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === professional.id
              ? "bg-ink text-white"
              : "text-muted hover:text-ink"
          }`}
        >
          {professional.name}
        </button>
      ))}
    </div>
  );
}
