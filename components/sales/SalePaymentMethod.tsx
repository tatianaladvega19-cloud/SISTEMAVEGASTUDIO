"use client";

import { formatPaymentMethod } from "@/lib/utils/format";
import type { PaymentMethod } from "@/lib/types";

interface SalePaymentMethodProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  error?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  "EFECTIVO",
  "TRANSFERENCIA",
  "TARJETA",
  "OTRO",
];

export default function SalePaymentMethod({
  value,
  onChange,
  error,
}: SalePaymentMethodProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              value === method
                ? "border-accent bg-accent-soft text-accent"
                : "border-line bg-background text-ink hover:border-accent/40"
            }`}
          >
            {formatPaymentMethod(method)}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
