"use client";

import { useMemo, useState, type FormEvent } from "react";
import FormField, { fieldControlClass } from "@/components/clients/FormField";
import SaleClientSelector from "@/components/sales/SaleClientSelector";
import {
  AGENDA_HOURS,
  APPOINTMENT_DURATION_OPTIONS,
  formatAgendaDate,
} from "@/lib/utils/agenda";
import { getProfessionalsForService } from "@/lib/utils/professionals";
import { formatCurrency, formatAppointmentStatus } from "@/lib/utils/format";
import { validateAppointmentFields } from "@/lib/validations/appointment";
import type {
  Appointment,
  AppointmentStatus,
  Client,
  Professional,
  ServiceProfessional,
} from "@/lib/types";
import type { ServiceWithCategory } from "@/lib/utils/services";

export interface AppointmentSubmitValues {
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  status: AppointmentStatus;
}

interface AppointmentFormProps {
  mode: "create" | "edit";
  date: string;
  time: string;
  clients: Client[];
  services: ServiceWithCategory[];
  professionals: Professional[];
  serviceProfessionals: ServiceProfessional[];
  appointment?: Appointment;
  /** Profesional preseleccionada, p. ej. si Agenda está filtrada por ella. */
  defaultProfessionalId?: string;
  /** Mensaje de conflicto de horario (p. ej. doble reserva) a mostrar sobre el formulario. */
  conflictError?: string | null;
  /** true mientras el Server Action está en curso: evita doble envío. */
  disabled?: boolean;
  onCancel: () => void;
  onSubmit: (values: AppointmentSubmitValues) => void;
}

// Estados que tiene sentido asignar manualmente desde el formulario.
// CANCELADA no aparece aquí: se cancela desde AppointmentDetail, con
// su propio paso de confirmación.
const EDITABLE_STATUS_OPTIONS: AppointmentStatus[] = [
  "PROGRAMADA",
  "CONFIRMADA",
  "COMPLETADA",
];

export default function AppointmentForm({
  mode,
  date,
  time,
  clients,
  services,
  professionals,
  serviceProfessionals,
  appointment,
  defaultProfessionalId,
  conflictError,
  disabled = false,
  onCancel,
  onSubmit,
}: AppointmentFormProps) {
  const isEdit = mode === "edit";

  const [selectedClient, setSelectedClient] = useState<Client | null>(
    () => clients.find((client) => client.id === appointment?.clientId) ?? null
  );
  const [serviceId, setServiceId] = useState(appointment?.serviceId ?? "");
  const [professionalId, setProfessionalId] = useState(
    appointment?.professionalId ?? defaultProfessionalId ?? ""
  );
  const [appointmentDate, setAppointmentDate] = useState(appointment?.date ?? date);
  const [appointmentTime, setAppointmentTime] = useState(appointment?.time ?? time);
  const [duration, setDuration] = useState(appointment?.duration ?? 60);
  const [notes, setNotes] = useState(appointment?.notes ?? "");
  const [status, setStatus] = useState<AppointmentStatus>(
    appointment?.status ?? "PROGRAMADA"
  );
  const [attempted, setAttempted] = useState(false);

  const eligibleProfessionals = useMemo(
    () =>
      serviceId
        ? getProfessionalsForService(serviceId, professionals, serviceProfessionals)
        : [],
    [serviceId, professionals, serviceProfessionals]
  );

  // Si el servicio cambia y la profesional elegida ya no puede
  // realizarlo, se descarta al vuelo (se deriva en cada render en vez de
  // sincronizarla con un efecto) para forzar una nueva selección válida.
  const selectedProfessionalId = eligibleProfessionals.some(
    (professional) => professional.id === professionalId
  )
    ? professionalId
    : "";

  const errors = validateAppointmentFields({
    clientId: selectedClient?.id ?? null,
    serviceId: serviceId || null,
    professionalId: selectedProfessionalId || null,
    duration,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);

    if (Object.keys(errors).length > 0) return;

    const service = services.find((item) => item.id === serviceId);
    const professional = professionals.find(
      (item) => item.id === selectedProfessionalId
    );
    if (!service || !professional || !selectedClient) return;

    onSubmit({
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      serviceId: service.id,
      serviceName: service.name,
      professionalId: professional.id,
      professionalName: professional.name,
      date: appointmentDate,
      time: appointmentTime,
      duration,
      notes: notes.trim() || undefined,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {conflictError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {conflictError}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-ink">
          Cliente<span className="text-accent"> *</span>
        </label>
        <div className="mt-1.5">
          <SaleClientSelector
            clients={clients}
            selectedClient={selectedClient}
            onSelect={setSelectedClient}
            onClear={() => setSelectedClient(null)}
          />
        </div>
        {attempted && errors.client && (
          <p className="mt-1.5 text-xs text-red-600">{errors.client}</p>
        )}
      </div>

      <FormField
        label="Servicio"
        htmlFor="appointment-service"
        required
        error={attempted ? errors.service : undefined}
      >
        <select
          id="appointment-service"
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          className={fieldControlClass(attempted && !!errors.service)}
        >
          <option value="">Seleccionar servicio</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {formatCurrency(service.price)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Profesional"
        htmlFor="appointment-professional"
        required
        error={attempted ? errors.professional : undefined}
      >
        <select
          id="appointment-professional"
          value={selectedProfessionalId}
          onChange={(event) => setProfessionalId(event.target.value)}
          disabled={!serviceId}
          className={fieldControlClass(attempted && !!errors.professional)}
        >
          <option value="">
            {serviceId ? "Seleccionar profesional" : "Selecciona primero un servicio"}
          </option>
          {eligibleProfessionals.map((professional) => (
            <option key={professional.id} value={professional.id}>
              {professional.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fecha" htmlFor="appointment-date">
          {isEdit ? (
            <input
              id="appointment-date"
              type="date"
              value={appointmentDate}
              onChange={(event) => setAppointmentDate(event.target.value)}
              className={fieldControlClass()}
            />
          ) : (
            <p className={`${fieldControlClass()} flex items-center text-muted`}>
              {formatAgendaDate(appointmentDate)}
            </p>
          )}
        </FormField>

        <FormField label="Hora" htmlFor="appointment-time">
          {isEdit ? (
            <select
              id="appointment-time"
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
              className={fieldControlClass()}
            >
              {AGENDA_HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          ) : (
            <p className={`${fieldControlClass()} flex items-center text-muted`}>
              {appointmentTime}
            </p>
          )}
        </FormField>
      </div>

      <FormField
        label="Duración"
        htmlFor="appointment-duration"
        required
        error={attempted ? errors.duration : undefined}
      >
        <select
          id="appointment-duration"
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
          className={fieldControlClass(attempted && !!errors.duration)}
        >
          {APPOINTMENT_DURATION_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} min
            </option>
          ))}
        </select>
      </FormField>

      {isEdit && (
        <FormField label="Estado" htmlFor="appointment-status">
          <select
            id="appointment-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as AppointmentStatus)}
            className={fieldControlClass()}
          >
            {EDITABLE_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatAppointmentStatus(option)}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Notas" htmlFor="appointment-notes">
        <textarea
          id="appointment-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Detalles adicionales sobre la cita..."
          className={fieldControlClass()}
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cita"}
        </button>
      </div>
    </form>
  );
}
