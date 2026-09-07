import PageHeader from "@/components/layout/PageHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentSales from "@/components/dashboard/RecentSales";
import RecentClients from "@/components/dashboard/RecentClients";
import TopServices from "@/components/dashboard/TopServices";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { mockSales, mockSaleItems } from "@/lib/mocks/sales";
import { mockClients } from "@/lib/mocks/clients";
import { mockActivityLogs } from "@/lib/mocks/activity-logs";
import { mockUsers } from "@/lib/mocks/users";
import {
  getDashboardMetrics,
  getRecentSales,
  getRecentClients,
  getTopServices,
  getRecentActivity,
} from "@/lib/utils/dashboard";
import { formatCurrency } from "@/lib/utils/format";

export default function DashboardPage() {
  const metrics = getDashboardMetrics(mockSales, mockClients, mockSaleItems);
  const recentSales = getRecentSales(mockSales, mockClients, mockSaleItems, 5);
  const recentClients = getRecentClients(mockClients, 5);
  const topServices = getTopServices(mockSaleItems, 5);
  const recentActivity = getRecentActivity(mockActivityLogs, mockUsers, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen general de la actividad de VEGA STUDIO."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ventas registradas"
          value={metrics.salesCount.toString()}
        />
        <MetricCard
          label="Ingresos totales"
          value={formatCurrency(metrics.totalRevenue)}
        />
        <MetricCard
          label="Clientes registrados"
          value={metrics.clientsCount.toString()}
        />
        <MetricCard
          label="Servicios realizados"
          value={metrics.servicesSoldCount.toString()}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentSales sales={recentSales} />
        <RecentClients clients={recentClients} />
        <TopServices services={topServices} />
        <RecentActivity logs={recentActivity} />
      </div>
    </div>
  );
}
