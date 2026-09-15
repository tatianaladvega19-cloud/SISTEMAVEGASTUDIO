// Tipo y estado inicial del formulario de "nuevo servicio".
//
// Vive fuera de actions.ts a propósito: un archivo con "use server"
// solo puede exportar funciones async (son las únicas que se
// convierten en referencias de Server Action); exportar aquí también
// una constante como initialCreateServiceState no se resuelve
// correctamente del lado del cliente.

export interface CreateServiceFormState {
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

export const initialCreateServiceState: CreateServiceFormState = {
  errors: {},
  values: {
    name: "",
    categoryId: "",
    description: "",
    price: "",
  },
};
