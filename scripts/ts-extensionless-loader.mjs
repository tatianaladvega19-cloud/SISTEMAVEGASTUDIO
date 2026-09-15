// Loader de módulos usado SOLO para correr las pruebas de
// lib/notifications/__tests__ con `node --test` (ver PASO 22 del
// sistema de notificaciones). No se usa en `next dev`/`next build`: ahí
// las importaciones relativas sin extensión y el alias "@/..."
// (convención del proyecto, ver tsconfig.json → paths y
// lib/utils/*.ts) las resuelve el bundler de Next.js.
//
// El resolutor nativo de módulos ESM de Node exige extensión explícita
// y no conoce el alias "@/...", así que aquí se traduce "@/..." a una
// ruta absoluta bajo la raíz del proyecto, y luego (para esa ruta y
// para las importaciones relativas) se intenta ".ts" cuando la
// resolución sin extensión falla, para poder ejecutar los .ts del
// proyecto tal cual están escritos.

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const projectRootUrl = pathToFileURL(
  join(dirname(fileURLToPath(import.meta.url)), "..") + "/"
).href;

export async function resolve(specifier, context, nextResolve) {
  const resolvedSpecifier = specifier.startsWith("@/")
    ? new URL(specifier.slice(2), projectRootUrl).href
    : specifier;

  try {
    return await nextResolve(resolvedSpecifier, context);
  } catch (error) {
    if (
      error?.code === "ERR_MODULE_NOT_FOUND" &&
      (resolvedSpecifier.startsWith("./") ||
        resolvedSpecifier.startsWith("../") ||
        resolvedSpecifier.startsWith("file://"))
    ) {
      return nextResolve(`${resolvedSpecifier}.ts`, context);
    }
    throw error;
  }
}
