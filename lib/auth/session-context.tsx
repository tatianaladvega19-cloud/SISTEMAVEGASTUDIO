"use client";

// Provider de sesión real de VEGA STUDIO, respaldado por Supabase Auth.
// Mantiene en memoria al usuario autenticado (perfil de `profiles`
// mapeado desde la sesión de Supabase) y lo expone a todo el árbol
// mediante `useSession()`. Sidebar y Topbar lo consumen para mostrar el
// usuario activo; el layout de (dashboard) lo consume para exigir
// sesión.

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
import { createClient } from "@/lib/supabase/client";
import { fetchProfile } from "./session";
import { saveProfileOverride, applyProfileOverride, type ProfileOverride } from "./profile";

interface SessionContextValue {
  /** Usuario autenticado activo, o null si no hay sesión iniciada. */
  user: User | null;
  /**
   * false mientras todavía no se resolvió la sesión de Supabase (evita
   * redirigir a /login antes de saber si en realidad hay sesión).
   */
  isReady: boolean;
  /** Intenta iniciar sesión contra Supabase Auth. Devuelve un mensaje de error legible, o null si fue exitoso. */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
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
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const resolveUser = async (userId: string | undefined) => {
      if (!userId) {
        if (active) setUser(null);
        return;
      }
      const profile = await fetchProfile(supabase, userId);
      if (active) setUser(profile ? applyProfileOverride(profile) : null);
    };

    supabase.auth.getSession().then(({ data }) => {
      resolveUser(data.session?.user.id).finally(() => {
        if (active) setIsReady(true);
      });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveUser(session?.user.id);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return "Correo o contraseña incorrectos.";
      }

      const profile = await fetchProfile(supabase, data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        return "Tu cuenta no tiene un perfil asignado. Contacta a un administrador.";
      }
      if (!profile.isActive) {
        await supabase.auth.signOut();
        return "Esta cuenta está inactiva. Contacta a un administrador.";
      }

      setUser(applyProfileOverride(profile));
      return null;
    },
    [supabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

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
