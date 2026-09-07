// Credenciales mock de VEGA STUDIO.
//
// Se guardan deliberadamente separadas de lib/mocks/users.ts: el
// modelo User (lib/types.ts) es público y se muestra en pantalla, así
// que nunca debe cargar contraseñas. Esto simula una tabla de
// credenciales aparte, tal como existiría con un backend real
// (usuarios vs. credenciales), sin hashing porque todavía no hay
// autenticación real.

import { mockAdmin, mockVendedor } from "./users";

export const DEFAULT_MOCK_PASSWORD = "vega123";

export const mockCredentials: Record<string, string> = {
  [mockAdmin.id]: DEFAULT_MOCK_PASSWORD,
  [mockVendedor.id]: DEFAULT_MOCK_PASSWORD,
};
