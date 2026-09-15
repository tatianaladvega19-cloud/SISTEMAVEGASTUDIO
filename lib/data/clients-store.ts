// Frontera entre la aplicación y Supabase para el módulo Clientes.
//
// Antes esta capa mantenía los clientes en un array en memoria del
// proceso del servidor. Ahora consulta directamente public.clients
// (ver supabase/migrations/20260909201050_initial_vega_studio_schema.sql
// y supabase/migrations/20260909210000_clients_temp_public_access.sql)
// a través de lib/supabase/server.ts (key publishable/anon, nunca
// service_role). El resto de la app sigue consumiendo las funciones de
// este módulo, no Supabase directamente, así que el mapeo entre las
// columnas de la tabla y el tipo Client vive únicamente aquí.

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { Client, ClientSource } from "@/lib/types";

interface ClientRow {
  id: string;
  full_name: string;
  identification: string;
  phone: string;
  email: string | null;
  address: string | null;
  source: ClientSource;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    fullName: row.full_name,
    cedula: row.identification,
    phone: row.phone,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    // created_by referencia profiles(id) (uuid). Sin Supabase Auth
    // conectado todavía, no hay un profiles.id real que corresponda al
    // usuario simulado (ver lib/mocks/users.ts), así que la columna
    // puede llegar en null; se expone como "" para no romper el tipo
    // Client (createdBy: string) mientras no exista ese vínculo.
    createdBy: row.created_by ?? "",
  };
}

// Es "invalid_text_representation": el id recibido no es un uuid
// válido (por ejemplo, un id de sesión de la etapa anterior en algún
// enlace viejo). Se trata igual que "no encontrado" en vez de romper
// la página con un error 500.
function isInvalidUuidError(error: { code?: string } | null): boolean {
  return error?.code === "22P02";
}

export async function getAllClients(): Promise<Client[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudieron obtener los clientes: ${error.message}`);
  }

  return (data ?? []).map(mapRowToClient);
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) return undefined;
    throw new Error(`No se pudo obtener el cliente: ${error.message}`);
  }

  return data ? mapRowToClient(data) : undefined;
}

export async function isCedulaTaken(
  cedula: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const normalized = cedula.trim();

  let query = supabase
    .from("clients")
    .select("id")
    .eq("identification", normalized);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw new Error(`No se pudo verificar la cédula: ${error.message}`);
  }

  return (data ?? []).length > 0;
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

export async function createClient(input: NewClientInput): Promise<Client> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      full_name: input.fullName.trim(),
      identification: input.cedula.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      source: input.source,
      // Ver nota de created_by en mapRowToClient: sin profiles.id real
      // todavía no se persiste (columna nullable), para no romper el
      // insert con un uuid inválido.
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un cliente registrado con esta cédula.");
    }
    throw new Error(`No se pudo crear el cliente: ${error.message}`);
  }

  return mapRowToClient(data);
}

export interface UpdateClientInput {
  fullName: string;
  cedula: string;
  phone: string;
  email?: string;
  address?: string;
  source: ClientSource;
}

export async function updateClient(
  id: string,
  input: UpdateClientInput
): Promise<Client> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .update({
      full_name: input.fullName.trim(),
      identification: input.cedula.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      source: input.source,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un cliente registrado con esta cédula.");
    }
    throw new Error(`No se pudo actualizar el cliente: ${error.message}`);
  }

  if (!data) {
    throw new Error("El cliente que intentas actualizar ya no existe.");
  }

  return mapRowToClient(data);
}
