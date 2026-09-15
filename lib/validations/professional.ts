// Validación del formulario de Profesional. Función pura, mismo patrón
// que lib/validations/service.ts: no conoce el origen de los datos
// (Supabase u otro), así que no depende de la capa de datos.

export interface ProfessionalFormValues {
  name: string;
  phone: string;
  email: string;
}

export interface ProfessionalFormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

const PHONE_PATTERN = /^[0-9+\-\s()]{6,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfessionalFields(
  values: ProfessionalFormValues
): ProfessionalFormErrors {
  const errors: ProfessionalFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "El nombre es obligatorio.";
  }

  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = "El teléfono no tiene un formato válido.";
  }

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "El email no tiene un formato válido.";
  }

  return errors;
}
