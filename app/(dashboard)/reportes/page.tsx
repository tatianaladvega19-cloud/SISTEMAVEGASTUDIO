import PageHeader from "@/components/layout/PageHeader";
import ReportsExplorer from "@/components/reports/ReportsExplorer";
import { mockSales, mockSaleItems } from "@/lib/mocks/sales";
import { mockServices } from "@/lib/mocks/services";
import { mockServiceCategories } from "@/lib/mocks/service-categories";
import { mockUsers } from "@/lib/mocks/users";

export default function ReportesPage() {
  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Consulta el desempeño del negocio en un solo lugar."
      />

      <ReportsExplorer
        sales={mockSales}
        saleItems={mockSaleItems}
        services={mockServices}
        categories={mockServiceCategories}
        users={mockUsers}
      />
    </div>
  );
}
