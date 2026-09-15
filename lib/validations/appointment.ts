// Validación del formulario de citas de Agenda (crear/editar). Función
// pura, mismo patrón que lib/validations/sale.ts: no conoce el origen
// de los datos ni cómo se muestra el error en pantalla.

export interface AppointmentFormValues {
  clientId: string | null;
  serviceId: string | null;
  professionalId: string | null;
  duration: number;
}

export interface AppointmentFormErrors {
  client?: string;
  service?: string;
  professional?: string;
  duration?: string;
}

export function validateAppointmentFields(
  values: AppointmentFormValues
): AppointmentFormErrors {
  const errors: AppointmentFormErrors = {};

  if (!values.clientId) {
    errors.client = "Selecciona un cliente para continuar.";
  }

  if (!values.serviceId) {
    errors.service = "Selecciona un servicio para continuar.";
  }

  if (!values.professionalId) {
    errors.professional = "Selecciona una profesional para continuar.";
  }

  if (!values.duration || values.duration < 15) {
    errors.duration = "Selecciona una duración válida.";
  }

  return errors;
}
