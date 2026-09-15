"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateServiceCategory } from "@/lib/data/services-store";
import { validateServiceCategoryFields } from "@/lib/validations/service-category";
import type { EditServiceCategoryFormState } from "./form-state";

export async function updateServiceCategoryAction(
  id: string,
  _prevState: EditServiceCategoryFormState,
  formData: FormData
): Promise<EditServiceCategoryFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const errors = validateServiceCategoryFields(values);

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  await updateServiceCategory(id, {
    name: values.name,
    description: values.description || undefined,
  });

  revalidatePath("/servicios");
  redirect("/servicios");
}
