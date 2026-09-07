"use server";

import { revalidatePath } from "next/cache";
import { createSale } from "@/lib/data/sales-store";
import { getClientById } from "@/lib/data/clients-store";
import { mockServices } from "@/lib/mocks/services";
import { mockVendedor } from "@/lib/mocks/users";
import { validateSaleFields } from "@/lib/validations/sale";
import type { PaymentMethod } from "@/lib/types";

export interface CreateSaleItemInput {
  serviceId: string;
  quantity: number;
}

export interface CreateSaleActionInput {
  clientId: string | null;
  paymentMethod: PaymentMethod | null;
  items: CreateSaleItemInput[];
}

export interface CreateSaleActionResult {
  success: boolean;
  error?: string;
  saleId?: string;
  total?: number;
}

// Vuelve a validar en el servidor (la UI ya valida lo mismo antes de
// llamar a esta acción, pero esta función es alcanzable por POST
// directo) y recalcula nombre/precio de cada servicio desde el
// catálogo en vez de confiar en lo que mande el cliente, igual que
// ocurriría con datos reales de una API.
export async function createSaleAction(
  input: CreateSaleActionInput
): Promise<CreateSaleActionResult> {
  const errors = validateSaleFields({
    clientId: input.clientId,
    items: input.items,
    paymentMethod: input.paymentMethod,
  });

  const firstError = errors.client ?? errors.items ?? errors.paymentMethod;
  if (firstError) {
    return { success: false, error: firstError };
  }

  const client = getClientById(input.clientId as string);
  if (!client) {
    return { success: false, error: "El cliente seleccionado ya no existe." };
  }

  const servicesById = new Map(
    mockServices.map((service) => [service.id, service])
  );

  const items = [];
  for (const item of input.items) {
    const service = servicesById.get(item.serviceId);
    if (!service || !service.isActive) {
      return {
        success: false,
        error: "Uno de los servicios seleccionados ya no está disponible.",
      };
    }

    items.push({
      serviceId: service.id,
      serviceName: service.name,
      unitPrice: service.price,
      quantity: item.quantity,
    });
  }

  const sale = createSale({
    clientId: client.id,
    sellerId: mockVendedor.id,
    paymentMethod: input.paymentMethod as PaymentMethod,
    items,
  });

  revalidatePath("/ventas");

  return { success: true, saleId: sale.id, total: sale.total };
}
