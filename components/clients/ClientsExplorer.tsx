"use client";

import { useMemo, useState } from "react";
import ClientSearch from "./ClientSearch";
import ClientTable from "./ClientTable";
import { searchClients } from "@/lib/utils/clients";
import type { Client } from "@/lib/types";

interface ClientsExplorerProps {
  clients: Client[];
}

export default function ClientsExplorer({ clients }: ClientsExplorerProps) {
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(
    () => searchClients(clients, query),
    [clients, query]
  );

  return (
    <div>
      <ClientSearch value={query} onChange={setQuery} />

      <p className="mt-3 text-sm text-muted">
        {filteredClients.length} de {clients.length} cliente
        {clients.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4">
        <ClientTable clients={filteredClients} />
      </div>
    </div>
  );
}
