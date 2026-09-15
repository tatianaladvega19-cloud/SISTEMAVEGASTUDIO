// Frontera entre la aplicación y Supabase para el módulo Servicios.
//
// Antes Servicios leía directamente lib/mocks/services.ts y
// lib/mocks/service-categories.ts desde la página. Ahora este módulo
// consulta directamente public.services / public.service_categories /
// public.service_professionals (ver
// supabase/migrations/20260909201050_initial_vega_studio_schema.sql y
// supabase/migrations/20260909220000_services_temp_public_access.sql)
// a través de lib/supabase/server.ts (key publishable/anon, nunca
// service_role). El resto de la app sigue consumiendo las funciones de
// este módulo, no Supabase directamente, así que el mapeo entre las
// columnas de las tablas y los tipos Service/ServiceCategory/
// ServiceProfessional vive únicamente aquí (mismo patrón que
// lib/data/clients-store.ts).

import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import type { Service, ServiceCategory, ServiceProfessional } from "@/lib/types";

interface ServiceCategoryRow {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function mapRowToServiceCategory(row: ServiceCategoryRow): ServiceCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    isActive: row.active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

interface ServiceRow {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  duration: number | null;
  price: number | string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function mapRowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    // services.category_id es "on delete set null": puede llegar en
    // null si la categoría fue borrada. Se expone como "" (mismo
    // patrón que createdBy en clients-store.ts) para no romper el
    // tipo Service (categoryId: string); getServicesWithCategory ya
    // maneja un categoryId sin categoría correspondiente mostrando
    // "Sin categoría".
    categoryId: row.category_id ?? "",
    description: row.description ?? undefined,
    duration: row.duration ?? undefined,
    // numeric(10,2) de Postgres puede llegar como string vía
    // supabase-js; se normaliza a number para no romper formatCurrency
    // ni los cálculos de lib/utils/services.ts.
    price: Number(row.price),
    isActive: row.active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

interface ServiceProfessionalRow {
  service_id: string;
  professional_id: string;
}

function mapRowToServiceProfessional(row: ServiceProfessionalRow): ServiceProfessional {
  return {
    serviceId: row.service_id,
    professionalId: row.professional_id,
  };
}

// Es "invalid_text_representation": el id recibido no es un uuid
// válido. Se trata igual que "no encontrado" en vez de romper la
// página con un error 500 (mismo criterio que clients-store.ts).
function isInvalidUuidError(error: { code?: string } | null): boolean {
  return error?.code === "22P02";
}

export async function getAllServiceCategories(): Promise<ServiceCategory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `No se pudieron obtener las categorías de servicio: ${error.message}`
    );
  }

  return (data ?? []).map(mapRowToServiceCategory);
}

export async function getServiceCategoryById(
  id: string
): Promise<ServiceCategory | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) return undefined;
    throw new Error(`No se pudo obtener la categoría: ${error.message}`);
  }

  return data ? mapRowToServiceCategory(data) : undefined;
}

export interface NewServiceCategoryInput {
  name: string;
  description?: string;
}

export async function createServiceCategory(
  input: NewServiceCategoryInput
): Promise<ServiceCategory> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("service_categories")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe una categoría con este nombre.");
    }
    throw new Error(`No se pudo crear la categoría: ${error.message}`);
  }

  return mapRowToServiceCategory(data);
}

export interface UpdateServiceCategoryInput {
  name: string;
  description?: string;
}

export async function updateServiceCategory(
  id: string,
  input: UpdateServiceCategoryInput
): Promise<ServiceCategory> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("service_categories")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) {
      throw new Error("La categoría que intentas actualizar ya no existe.");
    }
    if (error.code === "23505") {
      throw new Error("Ya existe una categoría con este nombre.");
    }
    throw new Error(`No se pudo actualizar la categoría: ${error.message}`);
  }

  if (!data) {
    throw new Error("La categoría que intentas actualizar ya no existe.");
  }

  return mapRowToServiceCategory(data);
}

export async function setServiceCategoryActive(
  id: string,
  isActive: boolean
): Promise<ServiceCategory> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("service_categories")
    .update({ active: isActive })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) {
      throw new Error("La categoría que intentas actualizar ya no existe.");
    }
    throw new Error(
      `No se pudo actualizar el estado de la categoría: ${error.message}`
    );
  }

  if (!data) {
    throw new Error("La categoría que intentas actualizar ya no existe.");
  }

  return mapRowToServiceCategory(data);
}

export async function getAllServices(): Promise<Service[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron obtener los servicios: ${error.message}`);
  }

  return (data ?? []).map(mapRowToService);
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isInvalidUuidError(error)) return undefined;
    throw new Error(`No se pudo obtener el servicio: ${error.message}`);
  }

  return data ? mapRowToService(data) : undefined;
}

export interface NewServiceInput {
  name: string;
  categoryId: string;
  description?: string;
  price: number;
  /** Duración típica en minutos. Sin definir, queda null (igual que hoy). */
  duration?: number;
}

export async function createService(input: NewServiceInput): Promise<Service> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("services")
    .insert({
      name: input.name.trim(),
      category_id: input.categoryId,
      description: input.description?.trim() || null,
      price: input.price,
      duration: input.duration ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`No se pudo crear el servicio: ${error.message}`);
  }

  return mapRowToService(data);
}

export interface UpdateServiceInput {
  name: string;
  categoryId: string;
  description?: string;
  price: number;
  // Opcional a propósito: el formulario de Servicios (ServiceForm.tsx)
  // todavía no tiene un campo de duración, así que updateServiceAction
  // nunca la envía. Si aquí se tratara como las demás columnas (siempre
  // presente en el payload), cada guardado desde ese formulario borraría
  // a null la duración ya cargada (p. ej. la de un servicio real como
  // "Extensión de Pestañas Clásicas"). Por eso solo se incluye en el
  // update cuando el caller la pasa explícitamente (ver más abajo);
  // omitirla dejar intacto el valor que ya tenía el servicio.
  duration?: number;
}

export async function updateService(
  id: string,
  input: UpdateServiceInput
): Promise<Service> {
  const supabase = await createSupabaseServerClient();

  const updatePayload: Record<string, unknown> = {
    name: input.name.trim(),
    category_id: input.categoryId,
    description: input.description?.trim() || null,
    price: input.price,
  };
  if (input.duration !== undefined) {
    updatePayload.duration = input.duration;
  }

  const { data, error } = await supabase
    .from("services")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo actualizar el servicio: ${error.message}`);
  }

  if (!data) {
    throw new Error("El servicio que intentas actualizar ya no existe.");
  }

  return mapRowToService(data);
}

export async function setServiceActive(
  id: string,
  isActive: boolean
): Promise<Service> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("services")
    .update({ active: isActive })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo actualizar el estado del servicio: ${error.message}`
    );
  }

  if (!data) {
    throw new Error("El servicio que intentas actualizar ya no existe.");
  }

  return mapRowToService(data);
}

// Relación Service <-> Professional (public.service_professionals), leída
// tal cual (sin aplanarla a texto) para preservarla de cara a un uso
// futuro (Agenda, selector de profesionales por servicio). No se expone
// todavía ningún flujo de escritura porque el formulario de Servicios de
// esta etapa no administra esta relación (ver lib/utils/professionals.ts:
// getProfessionalsForService, que sigue operando sobre estos mismos ids).
export async function getServiceProfessionalLinks(): Promise<
  ServiceProfessional[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_professionals")
    .select("service_id, professional_id");

  if (error) {
    throw new Error(
      `No se pudo obtener la relación servicio-profesional: ${error.message}`
    );
  }

  return (data ?? []).map(mapRowToServiceProfessional);
}
