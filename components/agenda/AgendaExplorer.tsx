"use client";

// Client Component principal del módulo Agenda. Las citas viven en el
// servidor (ver lib/data/appointments-store.ts): las altas/ediciones/
// cancelaciones se hacen a través de los Server Actions de
// app/(dashboard)/agenda/actions.ts, que además disparan el sistema de
// notificaciones (WhatsApp por Twilio + alertas internas). Este
// componente sigue manteniendo una copia local (`appointments`) para
// que la cuadrícula, el filtro por profesional y la validación de
// conflictos de horario respondan al instante, igual que antes; cada
// acción exitosa reemplaza el registro local por la cita que devuelve
// el servidor (ya con los campos de notificaciones actualizados).
//
// La vista es una cuadrícula semanal (lunes a domingo x 08:00-18:00):
// AgendaTable arma la cuadrícula a partir de `rows` (una fila por
// hora, con una celda por día) y este componente decide qué pasa al
// hacer clic en cada celda. Es UNA sola agenda: ProfessionalFilter solo
// cambia qué citas se muestran (rows), nunca cambia de ruta ni de
// componente.

import { useMemo, useState } from "react";
import AgendaDateNav from "./AgendaDateNav";
import AgendaTable from "./AgendaTable";
import AppointmentPanel from "./AppointmentPanel";
import ProfessionalFilter from "./ProfessionalFilter";
import AppointmentForm, {
  type AppointmentSubmitValues,
} from "./AppointmentForm";
import AppointmentDetail from "./AppointmentDetail";
import {
  addWeeksToISODate,
  buildWeekAgenda,
  getStartOfWeek,
  getWeekDates,
  hasScheduleConflict,
  toISODate,
} from "@/lib/utils/agenda";
import {
  ALL_PROFESSIONALS_FILTER,
  getActiveProfessionals,
} from "@/lib/utils/professionals";
import {
  cancelAppointmentAction,
  createAppointmentAction,
  updateAppointmentAction,
} from "@/app/(dashboard)/agenda/actions";
import type {
  Appointment,
  Client,
  Professional,
  ServiceProfessional,
} from "@/lib/types";
import type { ServiceWithCategory } from "@/lib/utils/services";

interface AgendaExplorerProps {
  initialAppointments: Appointment[];
  clients: Client[];
  services: ServiceWithCategory[];
  professionals: Professional[];
  serviceProfessionals: ServiceProfessional[];
}

type PanelState =
  | { mode: "create"; date: string; time: string }
  | { mode: "detail"; appointment: Appointment }
  | { mode: "edit"; appointment: Appointment }
  | null;

export default function AgendaExplorer({
  initialAppointments,
  clients,
  services,
  professionals,
  serviceProfessionals,
}: AgendaExplorerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments
  );
  const [weekStart, setWeekStart] = useState<string>(() =>
    getStartOfWeek(toISODate(new Date()))
  );
  const [professionalFilter, setProfessionalFilter] = useState<string>(
    ALL_PROFESSIONALS_FILTER
  );
  const [panel, setPanel] = useState<PanelState>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeProfessionals = useMemo(
    () => getActiveProfessionals(professionals),
    [professionals]
  );

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  // Cada profesional tiene su propia disponibilidad: la cuadrícula solo
  // se calcula a partir de las citas visibles según el filtro actual, sin
  // tocar el estado completo de `appointments` (ese siempre conserva a
  // todas las profesionales para poder validar conflictos).
  const visibleAppointments = useMemo(
    () =>
      professionalFilter === ALL_PROFESSIONALS_FILTER
        ? appointments
        : appointments.filter(
            (appointment) => appointment.professionalId === professionalFilter
          ),
    [appointments, professionalFilter]
  );

  const rows = useMemo(
    () => buildWeekAgenda(visibleAppointments, weekDates),
    [visibleAppointments, weekDates]
  );

  function handleEmptyClick(date: string, time: string) {
    setConflictError(null);
    setPanel({ mode: "create", date, time });
  }

  function handleAppointmentClick(appointment: Appointment) {
    setPanel({ mode: "detail", appointment });
  }

  // Valida el conflicto de horario en el cliente primero (feedback
  // instantáneo), pero el Server Action lo vuelve a validar contra el
  // estado real del servidor antes de guardar (defensa en profundidad,
  // igual que createSaleAction revalida servicios).
  async function handleCreate(values: AppointmentSubmitValues) {
    if (!panel || panel.mode !== "create") return;

    if (
      hasScheduleConflict(
        appointments,
        values.professionalId,
        values.date,
        values.time,
        values.duration
      )
    ) {
      setConflictError(
        `${values.professionalName} ya tiene una cita en ese horario. Elige otro horario disponible.`
      );
      return;
    }

    setSubmitting(true);
    const result = await createAppointmentAction({
      clientId: values.clientId,
      serviceId: values.serviceId,
      professionalId: values.professionalId,
      date: values.date,
      time: values.time,
      duration: values.duration,
      notes: values.notes,
    });
    setSubmitting(false);

    if (!result.success || !result.appointment) {
      setConflictError(result.error ?? "No se pudo crear la cita.");
      return;
    }

    setAppointments((current) => [...current, result.appointment as Appointment]);
    setConflictError(null);
    setPanel(null);
  }

  async function handleUpdate(values: AppointmentSubmitValues) {
    if (!panel || panel.mode !== "edit") return;
    const editedId = panel.appointment.id;

    if (
      hasScheduleConflict(
        appointments,
        values.professionalId,
        values.date,
        values.time,
        values.duration,
        editedId
      )
    ) {
      setConflictError(
        `${values.professionalName} ya tiene una cita en ese horario. Elige otro horario disponible.`
      );
      return;
    }

    setSubmitting(true);
    const result = await updateAppointmentAction(editedId, {
      clientId: values.clientId,
      serviceId: values.serviceId,
      professionalId: values.professionalId,
      date: values.date,
      time: values.time,
      duration: values.duration,
      notes: values.notes,
      status: values.status,
    });
    setSubmitting(false);

    if (!result.success || !result.appointment) {
      setConflictError(result.error ?? "No se pudo guardar la cita.");
      return;
    }

    const updated = result.appointment;
    setAppointments((current) =>
      current.map((item) => (item.id === editedId ? updated : item))
    );
    setConflictError(null);
    setPanel(null);
  }

  async function handleCancelAppointment(appointmentId: string) {
    setSubmitting(true);
    const result = await cancelAppointmentAction(appointmentId);
    setSubmitting(false);

    if (!result.success || !result.appointment) return;

    const cancelled = result.appointment;
    setAppointments((current) =>
      current.map((item) => (item.id === appointmentId ? cancelled : item))
    );
    setPanel(null);
  }

  function closePanel() {
    setConflictError(null);
    setPanel(null);
  }

  const panelOpen = panel !== null;
  const panelTitle =
    panel?.mode === "create"
      ? "Nueva cita"
      : panel?.mode === "edit"
        ? "Editar cita"
        : "Detalle de cita";

  return (
    <div>
      <div className="mt-2">
        <ProfessionalFilter
          professionals={activeProfessionals}
          value={professionalFilter}
          onChange={setProfessionalFilter}
        />
      </div>

      <div className="mt-4">
        <AgendaDateNav
          weekStart={weekStart}
          weekDates={weekDates}
          onJumpToDate={(date) => setWeekStart(getStartOfWeek(date))}
          onPrevious={() =>
            setWeekStart((current) => addWeeksToISODate(current, -1))
          }
          onNext={() =>
            setWeekStart((current) => addWeeksToISODate(current, 1))
          }
          onToday={() => setWeekStart(getStartOfWeek(toISODate(new Date())))}
        />
      </div>

      <div className="mt-6">
        <AgendaTable
          key={weekStart}
          rows={rows}
          weekDates={weekDates}
          showProfessional={professionalFilter === ALL_PROFESSIONALS_FILTER}
          onAppointmentClick={handleAppointmentClick}
          onEmptyClick={handleEmptyClick}
        />
      </div>

      <AppointmentPanel open={panelOpen} title={panelTitle} onClose={closePanel}>
        {panel?.mode === "create" && (
          <AppointmentForm
            mode="create"
            date={panel.date}
            time={panel.time}
            clients={clients}
            services={services}
            professionals={professionals}
            serviceProfessionals={serviceProfessionals}
            defaultProfessionalId={
              professionalFilter === ALL_PROFESSIONALS_FILTER
                ? undefined
                : professionalFilter
            }
            conflictError={conflictError}
            disabled={submitting}
            onCancel={closePanel}
            onSubmit={handleCreate}
          />
        )}

        {panel?.mode === "edit" && (
          <AppointmentForm
            mode="edit"
            date={panel.appointment.date}
            time={panel.appointment.time}
            clients={clients}
            services={services}
            professionals={professionals}
            serviceProfessionals={serviceProfessionals}
            appointment={panel.appointment}
            conflictError={conflictError}
            disabled={submitting}
            onCancel={() => {
              setConflictError(null);
              setPanel({ mode: "detail", appointment: panel.appointment });
            }}
            onSubmit={handleUpdate}
          />
        )}

        {panel?.mode === "detail" && (
          <AppointmentDetail
            appointment={panel.appointment}
            disabled={submitting}
            onEdit={() =>
              setPanel({ mode: "edit", appointment: panel.appointment })
            }
            onCancelAppointment={() =>
              handleCancelAppointment(panel.appointment.id)
            }
          />
        )}
      </AppointmentPanel>
    </div>
  );
}
