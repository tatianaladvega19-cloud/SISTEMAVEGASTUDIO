// Validación del formulario de Cliente. Función pura: no conoce el
// origen de los datos (mock, sesión o futura API), por eso recibe la
// verificación de cédula duplicada como dependencia en vez de
// importar la capa de datos directamente.

export interface ClientFormValues {
  fullName: string;
  cedula: string;
  phone: string;
}

export interface ClientFormErrors {
  fullName?: string;
  cedula?: string;
  phone?: string;
}

export function validateClientFields(
  values: ClientFormValues,
  isCedulaTaken: (cedula: string) => boolean
): ClientFormErrors {
  const errors: ClientFormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "El nombre completo es obligatorio.";
  }

  if (!values.cedula.trim()) {
    errors.cedula = "La cédula es obligatoria.";
  } else if (isCedulaTaken(values.cedula.trim())) {
    errors.cedula = "Ya existe un cliente registrado con esta cédula.";
  }

  if (!values.phone.trim()) {
    errors.phone = "El teléfono es obligatorio.";
  }

  return errors;
}
