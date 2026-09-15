"use server";

import { redirect } from "next/navigation";
import { updateClient, isCedulaTaken } from "@/lib/data/clients-store";
import { validateClientFields } from "@/lib/validations/client";
import type { ClientSource } from "@/lib/types";
import type { EditClientFormState } from "./form-state";

export async function updateClientAction(
  id: string,
  _prevState: EditClientFormState,
  formData: FormData
): Promise<EditClientFormState> {
  const values = {
    fullName: String(formData.get("fullName") ?? ""),
    cedula: String(formData.get("cedula") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address: String(formData.get("address") ?? ""),
    source: String(formData.get("source") ?? "INSTAGRAM") as ClientSource,
  };

  const cedulaTaken = await isCedulaTaken(values.cedula, id);
  const errors = validateClientFields(values, () => cedulaTaken);

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await updateClient(id, {
    fullName: values.fullName,
    cedula: values.cedula,
    phone: values.phone,
    email: values.email || undefined,
    address: values.address || undefined,
    source: values.source,
  });

  redirect(`/clientes/${id}`);
}
