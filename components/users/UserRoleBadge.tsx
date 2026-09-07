import { getRoleLabel } from "@/lib/auth/session";
import type { Role } from "@/lib/types";

interface UserRoleBadgeProps {
  role: Role;
}

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isAdmin ? "bg-accent-soft text-accent" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {getRoleLabel(role)}
    </span>
  );
}
