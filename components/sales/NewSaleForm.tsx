"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { IconCheck } from "@/components/layout/icons";
import SaleClientSelector from "./SaleClientSelector";
import SaleServiceSelector from "./SaleServiceSelector";
import SaleItemsList from "./SaleItemsList";
import SalePaymentMethod from "./SalePaymentMethod";
import SaleSummary from "./SaleSummary";
import { createSaleAction } from "@/app/(dashboard)/ventas/nueva/actions";
import { validateSaleFields } from "@/lib/validations/sale";
import { getDraftSaleSummary, type DraftSaleItem } from "@/lib/utils/sales";
import { formatCurrency } from "@/lib/utils/format";
import type { ServiceCategory, Client, PaymentMethod } from "@/lib/types";
import type { ServiceWithCategory } from "@/lib/utils/services";

interface NewSaleFormProps {
  clients: Client[];
  services: ServiceWithCategory[];
  categories: ServiceCategory[];
}

interface SuccessInfo {
  saleId: string;
  total: number;
  clientName: string;
}

export default function NewSaleForm({
  clients,
  services,
  categories,
}: NewSaleFormProps) {
  const router = useRouter();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<DraftSaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [attempted, setAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

  const summary = useMemo(() => getDraftSaleSummary(items), [items]);

  const errors = useMemo(
    () =>
      validateSaleFields({
        clientId: selectedClient?.id ?? null,
        items,
        paymentMethod,
      }),
    [selectedClient, items, paymentMethod]
  );

  function handleAddService(service: ServiceWithCategory) {
    setItems((current) => {
      const existing = current.find((item) => item.serviceId === service.id);
      if (existing) {
        return current.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...current,
        {
          serviceId: service.id,
          serviceName: service.name,
          unitPrice: service.price,
          quantity: 1,
        },
      ];
    });
  }

  function handleIncrement(serviceId: string) {
    setItems((current) =>
      current.map((item) =>
        item.serviceId === serviceId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function handleDecrement(serviceId: string) {
    setItems((current) =>
      current.map((item) =>
        item.serviceId === serviceId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  function handleRemove(serviceId: string) {
    setItems((current) => current.filter((item) => item.serviceId !== serviceId));
  }

  function resetForm() {
    setSelectedClient(null);
    setItems([]);
    setPaymentMethod(null);
    setAttempted(false);
    setSubmitError(null);
    setSuccess(null);
  }

  async function handleSubmit() {
    setAttempted(true);
    setSubmitError(null);

    const currentErrors = validateSaleFields({
      clientId: selectedClient?.id ?? null,
      items,
      paymentMethod,
    });
    if (Object.keys(currentErrors).length > 0) return;

    setPending(true);
    const result = await createSaleAction({
      clientId: selectedClient!.id,
      paymentMethod,
      items: items.map((item) => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
      })),
    });
    setPending(false);

    if (!result.success) {
      setSubmitError(result.error ?? "No se pudo registrar la venta.");
      return;
    }

    setSuccess({
      saleId: result.saleId!,
      total: result.total!,
      clientName: selectedClient!.fullName,
    });
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <IconCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink">
          Venta registrada
        </h2>
        <p className="mt-1 text-sm text-muted">
          Se registró la venta de {success.clientName} por{" "}
          {formatCurrency(success.total)}.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-background"
          >
            Registrar otra venta
          </button>
          <button
            type="button"
            onClick={() => router.push("/ventas")}
            className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Volver a ventas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <DashboardCard title="1. Cliente">
          <SaleClientSelector
            clients={clients}
            selectedClient={selectedClient}
            onSelect={setSelectedClient}
            onClear={() => setSelectedClient(null)}
            error={attempted ? errors.client : undefined}
          />
        </DashboardCard>

        <DashboardCard title="2. Servicios">
          <SaleServiceSelector
            services={services}
            categories={categories}
            onAdd={handleAddService}
          />
        </DashboardCard>

        <DashboardCard title="3. Resumen de la venta">
          <SaleItemsList
            items={items}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
            error={attempted ? errors.items : undefined}
          />
        </DashboardCard>
      </div>

      <div className="space-y-6 md:sticky md:top-6 md:self-start">
        <DashboardCard title="4. Método de pago">
          <SalePaymentMethod
            value={paymentMethod}
            onChange={setPaymentMethod}
            error={attempted ? errors.paymentMethod : undefined}
          />
        </DashboardCard>

        <DashboardCard title="Total">
          <SaleSummary summary={summary} />

          {submitError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Registrando..." : "Registrar venta"}
            </button>
            <Link
              href="/ventas"
              className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-background"
            >
              Cancelar
            </Link>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
