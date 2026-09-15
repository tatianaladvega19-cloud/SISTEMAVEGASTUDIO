// Tipo y estado inicial del formulario de "editar cliente".
//
// Mismo patrón que app/(dashboard)/clientes/nuevo/form-state.ts: vive
// fuera de actions.ts porque un archivo con "use server" solo puede
// exportar funciones async. A diferencia del alta, el estado inicial
// no es un objeto fijo: se calcula a partir del cliente existente, por
// eso se expone como función en vez de constante.

import type { Client, ClientSource } from "@/lib/types";

export interface EditClientFormState {
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

export function getInitialEditClientState(client: Client): EditClientFormState {
  return {
    errors: {},
    values: {
      fullName: client.fullName,
      cedula: client.cedula,
      phone: client.phone,
      email: client.email ?? "",
      address: client.address ?? "",
      source: client.source,
    },
  };
}
