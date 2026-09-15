"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createService } from "@/lib/data/services-store";
import { validateServiceFields } from "@/lib/validations/service";
import type { CreateServiceFormState } from "./form-state";

export async function createServiceAction(
  _prevState: CreateServiceFormState,
  formData: FormData
): Promise<CreateServiceFormState> {
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

  await createService({
    name: values.name,
    categoryId: values.categoryId,
    description: values.description || undefined,
    price: Number(values.price),
  });

  revalidatePath("/servicios");
  redirect("/servicios");
}
