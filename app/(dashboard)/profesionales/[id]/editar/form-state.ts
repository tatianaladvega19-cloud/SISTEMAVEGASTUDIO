// Tipo y estado inicial del formulario de "editar profesional". Mismo
// patrón que app/(dashboard)/servicios/[id]/editar/form-state.ts.

import type { Professional } from "@/lib/types";

export interface EditProfessionalFormState {
  errors: {
    name?: string;
    phone?: string;
    email?: string;
  };
  values: {
    name: string;
    specialty: string;
    phone: string;
    email: string;
    serviceIds: string[];
  };
}

export function getInitialEditProfessionalFormState(
  professional: Professional,
  serviceIds: string[]
): EditProfessionalFormState {
  return {
    errors: {},
    values: {
      name: professional.name,
      specialty: professional.specialty ?? "",
      phone: professional.phone ?? "",
      email: professional.email ?? "",
      serviceIds,
    },
  };
}
