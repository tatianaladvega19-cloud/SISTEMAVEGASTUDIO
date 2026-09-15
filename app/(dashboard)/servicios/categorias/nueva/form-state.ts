// Tipo y estado inicial del formulario de "nueva categoría".
//
// Vive fuera de actions.ts a propósito: un archivo con "use server"
// solo puede exportar funciones async (mismo motivo documentado en
// app/(dashboard)/servicios/nuevo/form-state.ts).

export interface CreateServiceCategoryFormState {
  errors: {
    name?: string;
  };
  values: {
    name: string;
    description: string;
  };
}

export const initialCreateServiceCategoryState: CreateServiceCategoryFormState = {
  errors: {},
  values: {
    name: "",
    description: "",
  },
};
