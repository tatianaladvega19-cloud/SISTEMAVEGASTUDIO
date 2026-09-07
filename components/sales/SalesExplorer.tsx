"use client";

import { useMemo, useState } from "react";
import SaleSearch from "./SaleSearch";
import SaleFilters from "./SaleFilters";
import SaleTable from "./SaleTable";
import {
  filterSales,
  defaultSaleFilters,
  type PaymentMethodFilter,
  type SaleWithClientDetails,
} from "@/lib/utils/sales";

interface SalesExplorerProps {
  sales: SaleWithClientDetails[];
}

export default function SalesExplorer({ sales }: SalesExplorerProps) {
  const [filters, setFilters] = useState(defaultSaleFilters);

  const filteredSales = useMemo(
    () => filterSales(sales, filters),
    [sales, filters]
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-sm sm:flex-1">
          <SaleSearch
            value={filters.search}
            onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
          />
        </div>
        <SaleFilters
          paymentMethod={filters.paymentMethod}
          onPaymentMethodChange={(paymentMethod: PaymentMethodFilter) =>
            setFilters((prev) => ({ ...prev, paymentMethod }))
          }
        />
      </div>

      <p className="mt-3 text-sm text-muted">
        {filteredSales.length} de {sales.length} venta
        {sales.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4">
        <SaleTable sales={filteredSales} />
      </div>
    </div>
  );
}
