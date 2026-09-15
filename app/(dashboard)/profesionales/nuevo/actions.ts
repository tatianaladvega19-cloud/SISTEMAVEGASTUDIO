"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProfessional,
  setProfessionalServices,
} from "@/lib/data/professionals-store";
import { validateProfessionalFields } from "@/lib/validations/professional";
import type { CreateProfessionalFormState } from "./form-state";

export async function createProfessionalAction(
  _prevState: CreateProfessionalFormState,
  formData: FormData
): Promise<CreateProfessionalFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    specialty: String(formData.get("specialty") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    serviceIds: formData.getAll("serviceIds").map(String),
  };

  const errors = validateProfessionalFields(values);

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const professional = await createProfessional({
    name: values.name,
    specialty: values.specialty || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
  });

  if (values.serviceIds.length > 0) {
    await setProfessionalServices(professional.id, values.serviceIds);
  }

  revalidatePath("/profesionales");
  redirect("/profesionales");
}
