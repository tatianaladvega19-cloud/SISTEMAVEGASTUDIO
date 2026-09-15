// Validación del formulario de Categoría de servicio. Función pura,
// mismo patrón que lib/validations/service.ts: no conoce el origen de
// los datos, así que no depende de la capa de datos.

export interface ServiceCategoryFormValues {
  name: string;
  description: string;
}

export interface ServiceCategoryFormErrors {
  name?: string;
}

export function validateServiceCategoryFields(
  values: ServiceCategoryFormValues
): ServiceCategoryFormErrors {
  const errors: ServiceCategoryFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "El nombre de la categoría es obligatorio.";
  }

  return errors;
}
