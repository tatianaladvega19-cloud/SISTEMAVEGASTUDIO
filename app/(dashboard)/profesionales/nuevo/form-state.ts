// Tipo y estado inicial del formulario de "nuevo profesional".
//
// Vive fuera de actions.ts a propósito: un archivo con "use server"
// solo puede exportar funciones async (son las únicas que se
// convierten en referencias de Server Action); exportar aquí también
// una constante como initialCreateProfessionalState no se resuelve
// correctamente del lado del cliente. Mismo patrón que
// app/(dashboard)/servicios/nuevo/form-state.ts.

export interface CreateProfessionalFormState {
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
    /** Service.id de los servicios seleccionados en el momento del submit. */
    serviceIds: string[];
  };
}

export const initialCreateProfessionalState: CreateProfessionalFormState = {
  errors: {},
  values: {
    name: "",
    specialty: "",
    phone: "",
    email: "",
    serviceIds: [],
  },
};
