import PageHeader from "@/components/layout/PageHeader";
import BusinessSettings from "@/components/settings/BusinessSettings";
import SystemPreferences from "@/components/settings/SystemPreferences";
import DataManagement from "@/components/settings/DataManagement";
import SystemInfo from "@/components/settings/SystemInfo";

export default function ConfiguracionPage() {
  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Ajusta las preferencias generales del sistema."
      />

      <div className="space-y-6">
        <BusinessSettings />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SystemPreferences />
          <DataManagement />
        </div>

        <SystemInfo />
      </div>
    </div>
  );
}
