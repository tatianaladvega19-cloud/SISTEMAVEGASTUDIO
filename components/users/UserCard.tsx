import Avatar from "@/components/ui/Avatar";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import type { User } from "@/lib/types";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
}

export default function UserCard({ user, onEdit, onToggleActive }: UserCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <UserRoleBadge role={user.role} />
        <UserStatusBadge isActive={user.isActive} />
      </div>

      <div className="mt-3 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onToggleActive(user)}
          className="text-xs font-medium text-muted hover:text-ink hover:underline"
        >
          {user.isActive ? "Desactivar" : "Activar"}
        </button>
        <button
          type="button"
          onClick={() => onEdit(user)}
          className="text-xs font-medium text-accent hover:underline"
        >
          Editar
        </button>
      </div>
    </div>
  );
}
