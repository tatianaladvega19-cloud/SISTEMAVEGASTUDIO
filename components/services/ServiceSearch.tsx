"use client";

interface ServiceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ServiceSearch({ value, onChange }: ServiceSearchProps) {
  return (
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar servicio por nombre..."
        className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
