// Capa temporal de datos para Clientes.
//
// Mientras no exista una API/base de datos real, este módulo es la
// única fuente de verdad para "clientes creados en la sesión actual".
// Vive en memoria del proceso del servidor: sobrevive entre
// peticiones mientras el servidor de Next.js siga corriendo, pero se
// pierde si se reinicia.
//
// El día que exista backend real, solo este archivo debería cambiar
// (sus funciones pasarían a hacer fetch/consultas a la API en vez de
// leer arrays en memoria); el resto de la app ya consume estas
// funciones y no la lista `mockClients` directamente.

import { mockClients } from "@/lib/mocks/clients";
import { findClientById } from "@/lib/utils/clients";
import type { Client, ClientSource } from "@/lib/types";

const sessionClients: Client[] = [];
let nextSessionId = 1;

export function getAllClients(): Client[] {
  return [...mockClients, ...sessionClients];
}

export function getClientById(id: string): Client | undefined {
  return findClientById(getAllClients(), id);
}

export function isCedulaTaken(cedula: string, excludeId?: string): boolean {
  const normalized = cedula.trim();
  return getAllClients().some(
    (client) => client.cedula === normalized && client.id !== excludeId
  );
}

export interface NewClientInput {
  fullName: string;
  cedula: string;
  phone: string;
  email?: string;
  address?: string;
  source: ClientSource;
  createdBy: string;
}

export function createClient(input: NewClientInput): Client {
  const now = new Date();

  const client: Client = {
    id: `client-session-${nextSessionId++}`,
    fullName: input.fullName.trim(),
    cedula: input.cedula.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || undefined,
    source: input.source,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };

  sessionClients.push(client);
  return client;
}
