// Cálculos, relaciones y filtros derivados para profesionales/empleadas.
// Mismo patrón que lib/utils/services.ts y lib/utils/clients.ts: reciben
// los datos como parámetros para que sigan funcionando igual el día que
// vengan de una API real.

import type { Professional, ServiceProfessional } from "../types";

// Valor del filtro de profesional en Agenda para "mostrar todas".
export const ALL_PROFESSIONALS_FILTER = "all";

export function getActiveProfessionals(
  professionals: Professional[]
): Professional[] {
  return professionals.filter((professional) => professional.isActive);
}

export function findProfessionalById(
  professionals: Professional[],
  id: string
): Professional | undefined {
  return professionals.find((professional) => professional.id === id);
}

// Profesionales activas habilitadas para realizar un servicio. Si el
// servicio todavía no tiene ninguna relación registrada en
// ServiceProfessional, se asume que cualquier profesional activa puede
// realizarlo (evita que un servicio recién creado quede sin nadie
// disponible mientras se configura la relación desde Administración).
export function getProfessionalsForService(
  serviceId: string,
  professionals: Professional[],
  serviceProfessionals: ServiceProfessional[]
): Professional[] {
  const active = getActiveProfessionals(professionals);
  const assignedIds = new Set(
    serviceProfessionals
      .filter((relation) => relation.serviceId === serviceId)
      .map((relation) => relation.professionalId)
  );

  if (assignedIds.size === 0) return active;

  return active.filter((professional) => assignedIds.has(professional.id));
}
