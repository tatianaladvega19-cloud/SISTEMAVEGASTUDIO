"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateService } from "@/lib/data/services-store";
import { validateServiceFields } from "@/lib/validations/service";
import type { EditServiceFormState } from "./form-state";

export async function updateServiceAction(
  id: string,
  _prevState: EditServiceFormState,
  formData: FormData
): Promise<EditServiceFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
  };

  const errors = validateServiceFields(values);

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await updateService(id, {
    name: values.name,
    categoryId: values.categoryId,
    description: values.description || undefined,
    price: Number(values.price),
  });

  revalidatePath("/servicios");
  redirect("/servicios");
}
