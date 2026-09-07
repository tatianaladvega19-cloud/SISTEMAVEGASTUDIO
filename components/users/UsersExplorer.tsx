"use client";

// Client Component principal del módulo Usuarios. Mientras no exista
// backend real, la lista de usuarios vive en estado local: parte de
// los usuarios mock (lib/mocks/users.ts) y las altas/ediciones solo
// existen en memoria del navegador (se pierden al recargar). El día
// que se conecte una API real, esta pantalla puede seguir igual y solo
// cambiaría de dónde vienen `initialUsers` y hacia dónde van los
// cambios (ver lib/data/clients-store.ts para el patrón equivalente ya
// aplicado en Clientes).

import { useMemo, useRef, useState } from "react";
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
import type { User } from "@/lib/types";

interface UsersExplorerProps {
  initialUsers: User[];
}

type ModalState = { mode: "create" } | { mode: "edit"; user: User } | null;

export default function UsersExplorer({ initialUsers }: UsersExplorerProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filters, setFilters] = useState(defaultUserFilters);
  const [modal, setModal] = useState<ModalState>(null);
  const nextLocalId = useRef(1);

  const metrics = useMemo(() => getUserMetrics(users), [users]);
  const filteredUsers = useMemo(() => filterUsers(users, filters), [users, filters]);

  const handleClearFilters = () => setFilters(defaultUserFilters);

  const handleToggleActive = (user: User) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? { ...item, isActive: !item.isActive, updatedAt: new Date() }
          : item
      )
    );
  };

  const handleSave = (values: UserFormSubmitValues) => {
    if (modal?.mode === "edit") {
      const editedId = modal.user.id;
      setUsers((prev) =>
        prev.map((item) =>
          item.id === editedId
            ? {
                ...item,
                name: values.name,
                email: values.email,
                username: values.username,
                role: values.role,
                isActive: values.isActive,
                updatedAt: new Date(),
              }
            : item
        )
      );
    } else {
      const now = new Date();
      const newUser: User = {
        id: `user-local-${nextLocalId.current++}`,
        name: values.name,
        email: values.email,
        username: values.username,
        role: values.role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      setUsers((prev) => [newUser, ...prev]);
    }

    setModal(null);
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

      <div className="mt-4">
        <UsersTable
          users={filteredUsers}
          onEdit={(user) => setModal({ mode: "edit", user })}
          onToggleActive={handleToggleActive}
          onClearFilters={handleClearFilters}
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
