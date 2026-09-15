// Tipo y estado inicial del formulario de "editar servicio". Mismo
// patrón que app/(dashboard)/clientes/[id]/editar/form-state.ts.

import type { Service } from "@/lib/types";

export interface EditServiceFormState {
  errors: {
    name?: string;
    categoryId?: string;
    price?: string;
  };
  values: {
    name: string;
    categoryId: string;
    description: string;
    price: string;
  };
}

export function getInitialEditServiceFormState(
  service: Service
): EditServiceFormState {
  return {
    errors: {},
    values: {
      name: service.name,
      categoryId: service.categoryId,
      description: service.description ?? "",
      price: String(service.price),
    },
  };
}
