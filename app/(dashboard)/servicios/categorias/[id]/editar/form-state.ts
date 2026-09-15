// Tipo y estado inicial del formulario de "editar categoría". Mismo
// patrón que app/(dashboard)/servicios/[id]/editar/form-state.ts.

import type { ServiceCategory } from "@/lib/types";

export interface EditServiceCategoryFormState {
  errors: {
    name?: string;
  };
  values: {
    name: string;
    description: string;
  };
}

export function getInitialEditServiceCategoryFormState(
  category: ServiceCategory
): EditServiceCategoryFormState {
  return {
    errors: {},
    values: {
      name: category.name,
      description: category.description ?? "",
    },
  };
}
