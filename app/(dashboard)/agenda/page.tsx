import PageHeader from "@/components/layout/PageHeader";
import AgendaExplorer from "@/components/agenda/AgendaExplorer";
import { getAllAppointments } from "@/lib/data/appointments-store";
import { getAllClients } from "@/lib/data/clients-store";
import { getAllProfessionals } from "@/lib/data/professionals-store";
import {
  getAllServices,
  getAllServiceCategories,
  getServiceProfessionalLinks,
} from "@/lib/data/services-store";
import { getServicesWithCategory } from "@/lib/utils/services";

// Citas, clientes, profesionales, servicios y categorías vienen de
// Supabase (ver lib/data/appointments-store.ts, lib/data/clients-store.ts,
// lib/data/professionals-store.ts y lib/data/services-store.ts), así que
// esta página no puede quedar cacheada de forma estática.
export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const [appointments, clients, professionals, services, categories, serviceProfessionals] =
    await Promise.all([
      getAllAppointments(),
      getAllClients(),
      getAllProfessionals(),
      getAllServices(),
      getAllServiceCategories(),
      getServiceProfessionalLinks(),
    ]);
  const activeServices = getServicesWithCategory(
    services.filter((service) => service.isActive),
    categories
  );

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Organiza las citas de la semana por profesional y gestiona su estado."
      />

      <AgendaExplorer
        initialAppointments={appointments}
        clients={clients}
        services={activeServices}
        professionals={professionals}
        serviceProfessionals={serviceProfessionals}
      />
    </div>
  );
}
