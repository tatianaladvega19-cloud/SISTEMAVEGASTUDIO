"use server";

import { revalidatePath } from "next/cache";
import { setServiceActive } from "@/lib/data/services-store";

// Activa/desactiva un servicio directamente desde el listado (tarjetas
// en móvil, tabla en escritorio), sin navegar a otra página. Se invoca
// como Server Action ligada (bind) al id y al próximo estado desde
// ServiceCard.tsx / ServicesTable.tsx.
export async function toggleServiceActiveAction(
  id: string,
  nextIsActive: boolean
): Promise<void> {
  await setServiceActive(id, nextIsActive);
  revalidatePath("/servicios");
}
