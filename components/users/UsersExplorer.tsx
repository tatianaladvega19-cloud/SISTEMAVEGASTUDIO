"use client";

// Client Component principal del módulo Usuarios. Los datos vienen
// del servidor (app/(dashboard)/usuarios/page.tsx -> lib/data/users-store.ts:
// listUsers, Supabase Auth + profiles reales); toda alta/edición/
// activación se ejecuta contra Server Actions (./actions.ts), que son
// las únicas que pueden tocar Supabase Auth Admin. El estado local
// (`users`) solo refleja lo que el servidor confirmó, para que la
// tabla no muestre nada que no se haya guardado de verdad.

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import PageHeader from "@/components/layout/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import UserSearch from "./UserSearch";
import UserFilters from "./UserFilters";
import UsersTable from "./UsersTable";
import UserForm, { type UserFormSubmitValues } from "./UserForm";
import {
  defaultUserFilters,
  filterUsers,
  getUserMetrics,
} from "@/lib/utils/users";
import {
  createUserAction,
  setUserActiveAction,
  updateUserAction,
} from "@/app/(dashboard)/usuarios/actions";
import type { User } from "@/lib/types";

interface UsersExplorerProps {
  initialUsers: User[];
}

type ModalState = { mode: "create" } | { mode: "edit"; user: User } | null;

export default function UsersExplorer({ initialUsers }: UsersExplorerProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filters, setFilters] = useState(defaultUserFilters);
  const [modal, setModal] = useState<ModalState>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const metrics = useMemo(() => getUserMetrics(users), [users]);
  const filteredUsers = useMemo(() => filterUsers(users, filters), [users, filters]);

  const handleClearFilters = () => setFilters(defaultUserFilters);

  const handleToggleActive = async (user: User) => {
    setListError(null);
    setTogglingId(user.id);

    const result = await setUserActiveAction(user.id, !user.isActive);

    if (!result.ok) {
      setListError(result.error);
      setTogglingId(null);
      return;
    }

    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? { ...item, isActive: !item.isActive, updatedAt: new Date() }
          : item
      )
    );
    setTogglingId(null);
    startTransition(() => router.refresh());
  };

  const handleSave = async (
    values: UserFormSubmitValues
  ): Promise<{ ok: boolean; error?: string; field?: string }> => {
    if (modal?.mode === "edit") {
      const editedId = modal.user.id;
      const result = await updateUserAction(editedId, {
        name: values.name,
        username: values.username,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
        password: values.password,
      });

      if (!result.ok) return result;

      setUsers((prev) =>
        prev.map((item) => (item.id === editedId ? result.user : item))
      );
      setModal(null);
      startTransition(() => router.refresh());
      return { ok: true };
    }

    if (!values.password) {
      return { ok: false, error: "La contraseña es obligatoria.", field: "password" };
    }

    const result = await createUserAction({
      name: values.name,
      username: values.username,
      email: values.email,
      role: values.role,
      isActive: values.isActive,
      password: values.password,
    });

    if (!result.ok) return result;

    setUsers((prev) => [result.user, ...prev]);
    setModal(null);
    startTransition(() => router.refresh());
    return { ok: true };
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Usuarios"
          description="Administra las cuentas y roles del equipo."
        />
        <button
          type="button"
          onClick={() => setModal({ mode: "create" })}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Usuarios totales" value={metrics.totalCount.toString()} />
        <MetricCard label="Usuarios activos" value={metrics.activeCount.toString()} />
        <MetricCard label="Administradores" value={metrics.adminsCount.toString()} />
        <MetricCard label="Vendedores" value={metrics.vendedoresCount.toString()} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-sm sm:flex-1">
          <UserSearch
            value={filters.search}
            onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          />
        </div>
        <UserFilters
          role={filters.role}
          onRoleChange={(role) => setFilters((prev) => ({ ...prev, role }))}
          status={filters.status}
          onStatusChange={(status) => setFilters((prev) => ({ ...prev, status }))}
        />
      </div>

      <p className="mt-3 text-sm text-muted">
        {filteredUsers.length} de {users.length} usuario
        {users.length === 1 ? "" : "s"}
      </p>

      {listError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {listError}
        </p>
      )}

      <div className="mt-4">
        <UsersTable
          users={filteredUsers}
          onEdit={(user) => setModal({ mode: "edit", user })}
          onToggleActive={handleToggleActive}
          onClearFilters={handleClearFilters}
          togglingId={togglingId}
        />
      </div>

      {modal && (
        <UserForm
          mode={modal.mode}
          user={modal.mode === "edit" ? modal.user : undefined}
          users={users}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
