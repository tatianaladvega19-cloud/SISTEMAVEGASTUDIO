"use client";

import type { PaymentMethodFilter } from "@/lib/utils/sales";

interface SaleFiltersProps {
  paymentMethod: PaymentMethodFilter;
  onPaymentMethodChange: (paymentMethod: PaymentMethodFilter) => void;
}

const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethodFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

export default function SaleFilters({
  paymentMethod,
  onPaymentMethodChange,
}: SaleFiltersProps) {
  return (
    <select
      value={paymentMethod}
      onChange={(event) =>
        onPaymentMethodChange(event.target.value as PaymentMethodFilter)
      }
      className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:w-56"
    >
      {PAYMENT_METHOD_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
