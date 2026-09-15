// Validación del formulario de Servicio. Función pura, mismo patrón que
// lib/validations/client.ts: no conoce el origen de los datos (mock,
// sesión o Supabase), así que no depende de la capa de datos.

export interface ServiceFormValues {
  name: string;
  categoryId: string;
  price: string;
}

export interface ServiceFormErrors {
  name?: string;
  categoryId?: string;
  price?: string;
}

export function validateServiceFields(
  values: ServiceFormValues
): ServiceFormErrors {
  const errors: ServiceFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "El nombre del servicio es obligatorio.";
  }

  if (!values.categoryId.trim()) {
    errors.categoryId = "La categoría es obligatoria.";
  }

  if (!values.price.trim()) {
    errors.price = "El precio es obligatorio.";
  } else {
    const price = Number(values.price);
    if (Number.isNaN(price) || price <= 0) {
      errors.price = "El precio debe ser un número mayor a 0.";
    }
  }

  return errors;
}
