"use client";

import { useMemo, useState } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import ReportsFilters from "./ReportsFilters";
import SalesPerformanceChart from "./SalesPerformanceChart";
import TopServicesReport from "./TopServicesReport";
import PaymentMethodsReport from "./PaymentMethodsReport";
import SellerPerformance from "./SellerPerformance";
import CategoryPerformance from "./CategoryPerformance";
import { formatCurrency } from "@/lib/utils/format";
import type { Sale, SaleItem, Service, ServiceCategory, User } from "@/lib/types";
import {
  defaultReportFilters,
  filterSales,
  filterSaleItemsBySales,
  getAvailableSellers,
  getReportMetrics,
  getSalesByDate,
  getTopServicesReport,
  getPaymentMethodReport,
  getSellerPerformance,
  getCategoryPerformance,
} from "@/lib/utils/reports";

interface ReportsExplorerProps {
  sales: Sale[];
  saleItems: SaleItem[];
  services: Service[];
  categories: ServiceCategory[];
  users: User[];
}

export default function ReportsExplorer({
  sales,
  saleItems,
  services,
  categories,
  users,
}: ReportsExplorerProps) {
  const [filters, setFilters] = useState(defaultReportFilters);

  const sellers = useMemo(() => getAvailableSellers(users), [users]);

  const filteredSales = useMemo(() => filterSales(sales, filters), [sales, filters]);

  const filteredSaleItems = useMemo(
    () => filterSaleItemsBySales(saleItems, filteredSales),
    [saleItems, filteredSales]
  );

  const metrics = useMemo(() => getReportMetrics(filteredSales), [filteredSales]);
  const salesByDate = useMemo(() => getSalesByDate(filteredSales), [filteredSales]);
  const topServices = useMemo(
    () => getTopServicesReport(filteredSaleItems, 5),
    [filteredSaleItems]
  );
  const paymentMethods = useMemo(
    () => getPaymentMethodReport(filteredSales),
    [filteredSales]
  );
  const sellerPerformance = useMemo(
    () => getSellerPerformance(filteredSales, users),
    [filteredSales, users]
  );
  const categoryPerformance = useMemo(
    () => getCategoryPerformance(filteredSaleItems, services, categories),
    [filteredSaleItems, services, categories]
  );

  return (
    <div>
      <ReportsFilters filters={filters} onChange={setFilters} sellers={sellers} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ingresos totales"
          value={formatCurrency(metrics.totalRevenue)}
        />
        <MetricCard label="Total de ventas" value={metrics.salesCount.toString()} />
        <MetricCard
          label="Ticket promedio"
          value={formatCurrency(metrics.averageTicket)}
        />
        <MetricCard
          label="Clientes atendidos"
          value={metrics.uniqueClientsCount.toString()}
        />
      </div>

      <div className="mt-6">
        <SalesPerformanceChart points={salesByDate} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TopServicesReport services={topServices} />
        <PaymentMethodsReport methods={paymentMethods} />
        <SellerPerformance sellers={sellerPerformance} />
      </div>

      <div className="mt-6">
        <CategoryPerformance categories={categoryPerformance} />
      </div>
    </div>
  );
}
