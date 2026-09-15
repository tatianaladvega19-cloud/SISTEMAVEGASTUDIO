// Registra scripts/ts-extensionless-loader.mjs como hook de módulos.
// Necesario porque `--import <archivo-con-resolve/load>` por sí solo no
// activa los hooks: hay que llamar a module.register() explícitamente
// (API estable desde Node 20.6/22). Uso: node --import
// ./scripts/register-ts-loader.mjs --test lib/notifications/__tests__

import { register } from "node:module";

register("./ts-extensionless-loader.mjs", import.meta.url);
