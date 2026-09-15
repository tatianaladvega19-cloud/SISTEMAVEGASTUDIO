"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceCategory } from "@/lib/data/services-store";
import { validateServiceCategoryFields } from "@/lib/validations/service-category";
import type { CreateServiceCategoryFormState } from "./form-state";

export async function createServiceCategoryAction(
  _prevState: CreateServiceCategoryFormState,
  formData: FormData
): Promise<CreateServiceCategoryFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const errors = validateServiceCategoryFields(values);

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await createServiceCategory({
    name: values.name,
    description: values.description || undefined,
  });

  revalidatePath("/servicios");
  redirect("/servicios");
}
