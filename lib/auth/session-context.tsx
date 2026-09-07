"use client";

// Provider de sesión simulada. Mantiene en memoria (y respaldado en
// localStorage, solo para no perder la selección al recargar) qué
// usuario mock está "logueado", y lo expone a todo el árbol mediante
// `useSession()`. Sidebar y Topbar lo consumen para mostrar el usuario
// activo; el layout de (dashboard) lo consume para exigir sesión.
//
// Esto es una simulación de UI, no seguridad real: cualquiera puede
// editar localStorage. Cuando exista autenticación real, esta es la
// pieza a reemplazar (por ejemplo por un provider respaldado en
// cookies de servidor), manteniendo la misma forma de `useSession()`.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import {
  findUserById,
  readStoredUserId,
  writeStoredUserId,
} from "./session";
import { saveProfileOverride, type ProfileOverride } from "./profile";

interface SessionContextValue {
  /** Usuario simulado activo, o null si no hay sesión iniciada. */
  user: User | null;
  /**
   * false mientras todavía no se leyó la sesión persistida (evita
   * redirigir a /login antes de saber si en realidad hay sesión).
   */
  isReady: boolean;
  login: (userId: string) => void;
  logout: () => void;
  /**
   * Actualiza los datos de perfil del usuario activo (nombre, username,
   * email, avatar). Es la única forma de mutar el usuario actual: el
   * cambio se guarda (ver lib/auth/profile.ts) y se refleja de
   * inmediato en todo lo que consuma useSession() (Sidebar, Topbar,
   * /perfil), sin duplicar el estado.
   */
  updateCurrentUser: (updates: ProfileOverride) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedId = readStoredUserId();
    setUser(storedId ? findUserById(storedId) ?? null : null);
    setIsReady(true);
  }, []);

  const login = useCallback((userId: string) => {
    const nextUser = findUserById(userId) ?? null;
    setUser(nextUser);
    writeStoredUserId(nextUser?.id ?? null);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStoredUserId(null);
  }, []);

  const updateCurrentUser = useCallback((updates: ProfileOverride) => {
    setUser((current) => {
      if (!current) return current;
      saveProfileOverride(current.id, updates);
      return { ...current, ...updates, updatedAt: new Date() };
    });
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, logout, updateCurrentUser }),
    [user, isReady, login, logout, updateCurrentUser]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>.");
  }
  return context;
}
