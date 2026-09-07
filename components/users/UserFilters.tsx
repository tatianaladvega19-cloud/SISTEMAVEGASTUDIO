"use client";

import { getRoleLabel } from "@/lib/auth/session";
import type { Role } from "@/lib/types";
import type { UserRoleFilter, UserStatusFilter } from "@/lib/utils/users";

interface UserFiltersProps {
  role: UserRoleFilter;
  onRoleChange: (role: UserRoleFilter) => void;
  status: UserStatusFilter;
  onStatusChange: (status: UserStatusFilter) => void;
}

const ROLE_OPTIONS: Role[] = ["ADMIN", "VENDEDOR"];

const STATUS_OPTIONS: Array<{ value: UserStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

export default function UserFilters({
  role,
  onRoleChange,
  status,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <select
        value={role}
        onChange={(event) => onRoleChange(event.target.value as UserRoleFilter)}
        className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:w-48"
      >
        <option value="all">Todos los roles</option>
        {ROLE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {getRoleLabel(option)}
          </option>
        ))}
      </select>

      <div className="inline-flex rounded-lg border border-line bg-surface p-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              status === option.value
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
