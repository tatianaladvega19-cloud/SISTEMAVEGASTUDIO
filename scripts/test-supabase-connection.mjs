// Prueba de conexión/configuración de Supabase (PASO de integración de
// infraestructura). Solo comprueba que las variables de entorno están
// presentes y que el cliente se puede inicializar correctamente. NO
// consulta ninguna tabla: el proyecto de Supabase puede estar vacío.
//
// Uso:
//   node --env-file=.env.local scripts/test-supabase-connection.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "[supabase] Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
  process.exit(1);
}

try {
  const supabase = createClient(url, key);

  if (!supabase) {
    throw new Error("createClient() no devolvió una instancia válida.");
  }

  console.log("[supabase] Variables de entorno presentes.");
  console.log(`[supabase] URL: ${url}`);
  console.log("[supabase] Cliente inicializado correctamente.");
  process.exit(0);
} catch (error) {
  console.error("[supabase] Error al inicializar el cliente:", error);
  process.exit(1);
}
