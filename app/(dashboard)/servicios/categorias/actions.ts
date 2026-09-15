"use server";

import { revalidatePath } from "next/cache";
import { setServiceCategoryActive } from "@/lib/data/services-store";

// Activa/desactiva una categoría directamente desde el listado
// (CategoryOverview.tsx), sin navegar a otra página. Mismo patrón que
// toggleServiceActiveAction en app/(dashboard)/servicios/actions.ts.
export async function toggleServiceCategoryActiveAction(
  id: string,
  nextIsActive: boolean
): Promise<void> {
  await setServiceCategoryActive(id, nextIsActive);
  revalidatePath("/servicios");
}
