// Matriz de permisos por rol. Es una referencia estática para guiar
// la UI y las validaciones futuras; todavía no se aplica en ninguna
// ruta ni se conecta a autenticación real.

import { Role } from "./types";

export interface Permisos {
  clientes: {
    ver: boolean;
    buscar: boolean;
    crear: boolean;
    /** Edición de datos básicos (nombre, teléfono, email, dirección, etc.). */
    editar: boolean;
    eliminar: boolean;
  };
  servicios: {
    administrar: boolean;
  };
  ventas: {
    registrar: boolean;
    /** Ver el listado global de ventas de todos los vendedores. */
    verTodas: boolean;
    /** Editar una venta ya registrada (histórica). */
    editarHistorico: boolean;
    eliminar: boolean;
  };
  usuarios: {
    administrar: boolean;
  };
  reportes: {
    ver: boolean;
    exportar: boolean;
  };
  configuracion: {
    administrar: boolean;
  };
}

export const PERMISOS_POR_ROL: Record<Role, Permisos> = {
  // ADMIN: control total sobre el sistema.
  ADMIN: {
    clientes: { ver: true, buscar: true, crear: true, editar: true, eliminar: true },
    servicios: { administrar: true },
    ventas: { registrar: true, verTodas: true, editarHistorico: true, eliminar: true },
    usuarios: { administrar: true },
    reportes: { ver: true, exportar: true },
    configuracion: { administrar: true },
  },
  // VENDEDOR: puede operar el día a día (clientes y ventas) pero no
  // puede eliminar registros, tocar el historial de ventas, exportar
  // información ni administrar usuarios/configuración.
  VENDEDOR: {
    clientes: { ver: true, buscar: true, crear: true, editar: true, eliminar: false },
    servicios: { administrar: false },
    ventas: { registrar: true, verTodas: false, editarHistorico: false, eliminar: false },
    usuarios: { administrar: false },
    reportes: { ver: false, exportar: false },
    configuracion: { administrar: false },
  },
};
