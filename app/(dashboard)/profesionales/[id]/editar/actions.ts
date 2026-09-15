"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  updateProfessional,
  setProfessionalServices,
} from "@/lib/data/professionals-store";
import { validateProfessionalFields } from "@/lib/validations/professional";
import type { EditProfessionalFormState } from "./form-state";

export async function updateProfessionalAction(
  id: string,
  _prevState: EditProfessionalFormState,
  formData: FormData
): Promise<EditProfessionalFormState> {
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

  await updateProfessional(id, {
    name: values.name,
    specialty: values.specialty || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
  });

  await setProfessionalServices(id, values.serviceIds);

  revalidatePath("/profesionales");
  redirect("/profesionales");
}
