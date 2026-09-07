// Validación del formulario de "nueva venta". Función pura: no conoce
// el origen de los datos (mock, sesión o futura API) ni cómo se
// muestra el error, solo las reglas mínimas para registrar una venta
// (mismo patrón que lib/validations/client.ts).

import type { PaymentMethod } from "../types";

export interface SaleFormItemInput {
  quantity: number;
}

export interface SaleFormValues {
  clientId: string | null;
  items: SaleFormItemInput[];
  paymentMethod: PaymentMethod | null;
}

export interface SaleFormErrors {
  client?: string;
  items?: string;
  paymentMethod?: string;
}

export function validateSaleFields(values: SaleFormValues): SaleFormErrors {
  const errors: SaleFormErrors = {};

  if (!values.clientId) {
    errors.client = "Selecciona un cliente para continuar.";
  }

  if (values.items.length === 0) {
    errors.items = "Agrega al menos un servicio a la venta.";
  } else if (values.items.some((item) => item.quantity < 1)) {
    errors.items = "La cantidad de cada servicio debe ser al menos 1.";
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = "Selecciona un método de pago.";
  }

  return errors;
}
