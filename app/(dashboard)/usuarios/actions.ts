"use server";

// Server Actions del módulo Usuarios (PASO: administración real de
// usuarios). Cada una vuelve a verificar autorización dentro de
// lib/data/users-store.ts (requireAdminProfile) aunque la UI ya oculte
// los botones a quien no es ADMIN: un Server Action es un endpoint
// alcanzable por cualquiera que pueda mandar el mismo POST, no solo
// por quien lo ve en pantalla.
//
// Se devuelve un resultado serializable en vez de lanzar: components/
// users/UsersExplorer.tsx (Client Component) llama a estas funciones
// directamente desde manejadores de evento (no con <form action>), así
// que necesita poder mostrar el error sin que Next.js lo trate como una
// excepción no controlada.

import { revalidatePath } from "next/cache";
import {
  createUserAccount,
  updateUserAccount,
  setUserActive,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/data/users-store";
import { UnauthorizedError } from "@/lib/auth/require-admin";
import type { User } from "@/lib/types";

export type UsersActionResult =
  | { ok: true; user: User }
  | { ok: false; error: string; field?: string };

export type ToggleActiveResult = { ok: true } | { ok: false; error: string };

function toErrorResult(error: unknown): { ok: false; error: string; field?: string } {
  if (error instanceof UnauthorizedError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof Error) {
    const field = "field" in error ? (error as { field?: string }).field : undefined;
    return { ok: false, error: error.message, field };
  }
  return { ok: false, error: "Ocurrió un error inesperado. Intenta nuevamente." };
}

export async function createUserAction(
  input: CreateUserInput
): Promise<UsersActionResult> {
  try {
    const user = await createUserAccount(input);
    revalidatePath("/usuarios");
    return { ok: true, user };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function updateUserAction(
  id: string,
  input: UpdateUserInput
): Promise<UsersActionResult> {
  try {
    const user = await updateUserAccount(id, input);
    revalidatePath("/usuarios");
    return { ok: true, user };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function setUserActiveAction(
  id: string,
  nextActive: boolean
): Promise<ToggleActiveResult> {
  try {
    await setUserActive(id, nextActive);
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    return toErrorResult(error);
  }
}
