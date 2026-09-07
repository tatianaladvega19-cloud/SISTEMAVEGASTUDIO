// Iconos de línea, dibujados a mano como SVG simples (sin librerías
// externas). Todos comparten el mismo estilo: trazo fino, sin relleno,
// para una apariencia limpia y consistente en el layout.

interface IconProps {
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconDashboard({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" />
    </svg>
  );
}

export function IconClients({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9.5" cy="8" r="3.3" />
      <path d="M3.5 20c0-3.5 2.7-5.8 6-5.8s6 2.3 6 5.8" />
      <circle cx="17.5" cy="7.3" r="2.3" />
      <path d="M15.6 14.3c2.4.3 4.1 2.3 4.1 5.1" />
    </svg>
  );
}

export function IconServices({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <line x1="19.5" y1="4.5" x2="8" y2="16" />
      <line x1="8" y1="8" x2="19.5" y2="19.5" />
    </svg>
  );
}

export function IconSales({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7.5 8V6.3a4.5 4.5 0 0 1 9 0V8" />
      <path d="M5.3 8h13.4l-.9 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5.3 8Z" />
    </svg>
  );
}

export function IconReports({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="3.5" y1="20.5" x2="20.5" y2="20.5" />
      <rect x="5.5" y="12.5" width="3" height="8" rx="0.6" />
      <rect x="10.8" y="7" width="3" height="13.5" rx="0.6" />
      <rect x="16.1" y="10" width="3" height="10.5" rx="0.6" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9.8" cy="7.8" r="3.3" />
      <path d="M4 19.5c0-3.4 2.6-5.6 5.8-5.6s5.8 2.2 5.8 5.6" />
      <circle cx="18" cy="16.8" r="2.1" />
      <line x1="18" y1="14" x2="18" y2="14.9" />
      <line x1="18" y1="18.7" x2="18" y2="19.6" />
      <line x1="15.4" y1="16.8" x2="16.3" y2="16.8" />
      <line x1="19.7" y1="16.8" x2="20.6" y2="16.8" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="3.5" y1="6.5" x2="20.5" y2="6.5" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
      <line x1="3.5" y1="17.5" x2="20.5" y2="17.5" />
      <circle cx="8.5" cy="6.5" r="1.8" />
      <circle cx="16" cy="12" r="1.8" />
      <circle cx="11" cy="17.5" r="1.8" />
    </svg>
  );
}

export function IconMenu({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="3.5" y1="6.5" x2="20.5" y2="6.5" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
      <line x1="3.5" y1="17.5" x2="20.5" y2="17.5" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="12" y1="4.5" x2="12" y2="19.5" />
      <line x1="4.5" y1="12" x2="19.5" y2="12" />
    </svg>
  );
}

export function IconMinus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="4.5" y1="12" x2="19.5" y2="12" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="4.5" y1="7" x2="19.5" y2="7" />
      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
      <path d="M6.5 7l1 12.5A1.5 1.5 0 0 0 9 20.9h6a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <line x1="10" y1="11" x2="10" y2="16.5" />
      <line x1="14" y1="11" x2="14" y2="16.5" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 20.5H5.5a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 5.5 3.5H9" />
      <line x1="20.5" y1="12" x2="10" y2="12" />
      <path d="M16.5 7.5 21 12l-4.5 4.5" />
    </svg>
  );
}
