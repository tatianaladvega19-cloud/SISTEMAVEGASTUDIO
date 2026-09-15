"use server";

import { revalidatePath } from "next/cache";
import { setProfessionalActive } from "@/lib/data/professionals-store";

// Activa/desactiva un profesional directamente desde el listado (tarjetas
// en móvil, tabla en escritorio), sin navegar a otra página. Se invoca
// como Server Action ligada (bind) al id y al próximo estado desde
// ProfessionalCard.tsx / ProfessionalsTable.tsx. Nunca elimina el
// registro: desactivar solo cambia professionals.active (ver
// lib/data/professionals-store.ts: setProfessionalActive).
export async function toggleProfessionalActiveAction(
  id: string,
  nextIsActive: boolean
): Promise<void> {
  await setProfessionalActive(id, nextIsActive);
  revalidatePath("/profesionales");
}
