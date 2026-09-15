"use server";

import { redirect } from "next/navigation";
import { createClient, isCedulaTaken } from "@/lib/data/clients-store";
import { validateClientFields } from "@/lib/validations/client";
import { mockVendedor } from "@/lib/mocks/users";
import type { ClientSource } from "@/lib/types";
import type { CreateClientFormState } from "./form-state";

export async function createClientAction(
  _prevState: CreateClientFormState,
  formData: FormData
): Promise<CreateClientFormState> {
  const values = {
    fullName: String(formData.get("fullName") ?? ""),
    cedula: String(formData.get("cedula") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    source: String(formData.get("source") ?? "INSTAGRAM") as ClientSource,
  };

  const cedulaTaken = await isCedulaTaken(values.cedula);
  const errors = validateClientFields(values, () => cedulaTaken);

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const client = await createClient({
    fullName: values.fullName,
    cedula: values.cedula,
    phone: values.phone,
    email: values.email || undefined,
    address: values.address || undefined,
    source: values.source,
    createdBy: mockVendedor.id,
  });

  redirect(`/clientes/${client.id}`);
}
