// Tipo y estado inicial del formulario de "nuevo cliente".
//
// Vive fuera de actions.ts a propósito: un archivo con "use server"
// solo puede exportar funciones async (son las únicas que se
// convierten en referencias de Server Action); exportar aquí también
// una constante como initialCreateClientState no se resuelve
// correctamente del lado del cliente.

import type { ClientSource } from "@/lib/types";

export interface CreateClientFormState {
  errors: {
    fullName?: string;
    cedula?: string;
    phone?: string;
  };
  values: {
    fullName: string;
    cedula: string;
    phone: string;
    email: string;
    address: string;
    source: ClientSource;
  };
}

export const initialCreateClientState: CreateClientFormState = {
  errors: {},
  values: {
    fullName: "",
    cedula: "",
    phone: "",
    email: "",
    address: "",
    source: "INSTAGRAM",
  },
};
