import Avatar from "@/components/ui/Avatar";
import UserCard from "./UserCard";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/lib/types";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onClearFilters: () => void;
}

export default function UsersTable({
  users,
  onEdit,
  onToggleActive,
  onClearFilters,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="text-sm font-medium text-ink">
          No encontramos usuarios con estos criterios.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 text-sm font-medium text-accent hover:underline"
        >
          Limpiar filtros
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Usuario</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Fecha de creación</th>
              <th className="px-5 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-background/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
                    <span className="font-medium text-ink">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted">{user.email}</td>
                <td className="px-5 py-3">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-5 py-3">
                  <UserStatusBadge isActive={user.isActive} />
                </td>
                <td className="px-5 py-3 text-muted">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(user)}
                      className="text-sm font-medium text-muted hover:text-ink hover:underline"
                    >
                      {user.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
