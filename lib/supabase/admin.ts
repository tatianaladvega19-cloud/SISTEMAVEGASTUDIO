// Cliente administrativo de Supabase (service role / secret key).
//
// Este módulo es EXCLUSIVO de servidor: usa la clave secreta de
// Supabase, que tiene permisos para saltarse RLS y para administrar
// auth.users (supabase.auth.admin.*). El import "server-only" hace que
// el build de Next.js falle si algún Client Component llegara a
// importar este archivo, así que nunca puede terminar en el bundle que
// se envía al navegador.
//
// No reemplaza a lib/supabase/server.ts ni a lib/supabase/client.ts:
// esos siguen siendo el camino normal (con RLS activo) para todo lo
// que no sea administración de cuentas. Este cliente solo debe usarse
// desde código que ya verificó, con la sesión real del usuario
// (lib/auth/require-admin.ts), que quien pide la operación es un
// ADMIN activo.

import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY necesarias para administrar usuarios."
    );
  }

  cachedClient = createSupabaseClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedClient;
}
