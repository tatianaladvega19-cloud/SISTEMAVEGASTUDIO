// Frontera entre la aplicación y Supabase para el módulo Profesionales.
//
// Antes Profesionales leía lib/mocks/professionals.ts a través de un
// store en memoria (ids de texto como "prof-camila"). Ahora este módulo
// consulta directamente public.professionals / public.service_professionals
// (ver supabase/migrations/20260909201050_initial_vega_studio_schema.sql
// y supabase/migrations/20260915120000_professionals_temp_public_access.sql)
// a través de lib/supabase/server.ts (key publishable/anon, nunca
// service_role). El resto de la app sigue consumiendo las funciones de
// este módulo, no Supabase directamente, así que el mapeo entre las
// columnas de la tabla y el tipo Professional vive únicamente aquí
// (mismo patrón que lib/data/services-store.ts). Los ids ahora son los
// uuid reales generados por Supabase, no ids de sesión en memoria.

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { Professional } from "@/lib/types";

interface ProfessionalRow {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function mapRowToProfessional(row: ProfessionalRow): Professional {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    isActive: row.active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Es "invalid_text_representation": el id recibido no es un uuid
// válido. Se trata igual que "no encontrado" en vez de romper la
// página con un error 500 (mismo criterio que services-store.ts).
function isInvalidUuidError(error: { code?: string } | null): boolean {
  return error?.code === "22P02";
}

export async function getAllProfessionals(): Promise<Professional[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron obtener los profesionales: ${error.message}`);
  }

  return (data ?? []).map(mapRowToProfessional);
}

export async function getProfessionalById(
  id: string
): Promise<Professional | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) return undefined;
    throw new Error(`No se pudo obtener el profesional: ${error.message}`);
  }

  return data ? mapRowToProfessional(data) : undefined;
}

export interface NewProfessionalInput {
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export async function createProfessional(
  input: NewProfessionalInput
): Promise<Professional> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("professionals")
    .insert({
      name: input.name.trim(),
      specialty: input.specialty?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`No se pudo crear el profesional: ${error.message}`);
  }

  return mapRowToProfessional(data);
}

export interface UpdateProfessionalInput {
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export async function updateProfessional(
  id: string,
  input: UpdateProfessionalInput
): Promise<Professional> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("professionals")
    .update({
      name: input.name.trim(),
      specialty: input.specialty?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) {
      throw new Error("El profesional que intentas actualizar ya no existe.");
    }
    throw new Error(`No se pudo actualizar el profesional: ${error.message}`);
  }

  if (!data) {
    throw new Error("El profesional que intentas actualizar ya no existe.");
  }

  return mapRowToProfessional(data);
}

// Desactivar/activar NUNCA borra el registro (regla de negocio: un
// profesional inactivo se conserva junto con su historial de citas y sus
// relaciones en service_professionals). No existe una función de borrado
// físico en este store a propósito: la UI no debe ofrecer esa opción.
export async function setProfessionalActive(
  id: string,
  isActive: boolean
): Promise<Professional> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("professionals")
    .update({ active: isActive })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) {
      throw new Error("El profesional que intentas actualizar ya no existe.");
    }
    throw new Error(
      `No se pudo actualizar el estado del profesional: ${error.message}`
    );
  }

  if (!data) {
    throw new Error("El profesional que intentas actualizar ya no existe.");
  }

  return mapRowToProfessional(data);
}

// Relación Professional <-> Service (public.service_professionals): ids
// de los servicios que puede realizar un profesional. Se usa para
// precargar el selector de checkboxes de ProfessionalForm en modo edición.
export async function getServiceIdsForProfessional(
  professionalId: string
): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_professionals")
    .select("service_id")
    .eq("professional_id", professionalId);

  if (error) {
    if (isInvalidUuidError(error)) return [];
    throw new Error(
      `No se pudo obtener los servicios del profesional: ${error.message}`
    );
  }

  return (data ?? []).map((row) => row.service_id as string);
}

// Sincroniza public.service_professionals con los ids de servicio
// enviados desde el formulario. Nunca hace DELETE ALL + INSERT ALL:
// compara contra las relaciones actuales y solo inserta los pares nuevos
// y borra los pares desmarcados, para no generar churn ni duplicados.
export async function setProfessionalServices(
  professionalId: string,
  serviceIds: string[]
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const currentIds = await getServiceIdsForProfessional(professionalId);

  const currentIdsSet = new Set(currentIds);
  const nextIdsSet = new Set(serviceIds);

  const toInsert = serviceIds.filter((id) => !currentIdsSet.has(id));
  const toDelete = currentIds.filter((id) => !nextIdsSet.has(id));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("service_professionals").insert(
      toInsert.map((serviceId) => ({
        professional_id: professionalId,
        service_id: serviceId,
      }))
    );

    if (error) {
      throw new Error(
        `No se pudieron asignar los servicios al profesional: ${error.message}`
      );
    }
  }

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("service_professionals")
      .delete()
      .eq("professional_id", professionalId)
      .in("service_id", toDelete);

    if (error) {
      throw new Error(
        `No se pudieron quitar los servicios del profesional: ${error.message}`
      );
    }
  }
}
