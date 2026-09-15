import { formatAppointmentStatus } from "@/lib/utils/format";
import type { AppointmentStatus } from "@/lib/types";

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

const STYLES: Record<AppointmentStatus, string> = {
  PROGRAMADA: "bg-accent-soft text-accent",
  CONFIRMADA: "bg-emerald-50 text-emerald-700",
  COMPLETADA: "bg-zinc-100 text-zinc-600",
  CANCELADA: "bg-red-50 text-red-700",
};

export default function AppointmentStatusBadge({
  status,
}: AppointmentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {formatAppointmentStatus(status)}
    </span>
  );
}
