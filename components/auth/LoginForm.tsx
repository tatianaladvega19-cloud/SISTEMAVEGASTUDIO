"use client";

// Formulario de login simulado. No valida contraseña contra ningún
// backend: solo busca el email entre lib/mocks/users.ts y, si existe,
// marca ese usuario como la sesión activa (ver lib/auth/session-context).
//
// Cuando exista autenticación real, esta es la pieza a reemplazar: el
// <form> pasaría a llamar a un endpoint/Server Action en vez de
// findUserByEmail, manteniendo el mismo layout visual.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fieldControlClass } from "@/components/clients/FormField";
import Avatar from "@/components/ui/Avatar";
import { useSession } from "@/lib/auth/session-context";
import { findUserByEmail, getRoleLabel } from "@/lib/auth/session";
import { mockUsers } from "@/lib/mocks/users";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const enterAs = (userId: string) => {
    setError(null);
    setPendingUserId(userId);
    login(userId);
    router.push("/dashboard");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const user = findUserByEmail(email);
    if (!user) {
      setError("No encontramos un usuario de prueba con ese correo.");
      return;
    }
    if (!password) {
      setError("Ingresa una contraseña para continuar.");
      return;
    }

    enterAs(user.id);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Correo electrónico
          </label>
          <div className="mt-1.5">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tucorreo@vegastudio.com"
              className={fieldControlClass()}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Contraseña
          </label>
          <div className="mt-1.5">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={fieldControlClass()}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Iniciar sesión
        </button>
      </form>

      <div>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Usuarios de prueba
          </p>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mockUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => enterAs(user.id)}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 text-left transition-colors hover:border-accent hover:bg-accent-soft/40 disabled:opacity-60"
              disabled={pendingUserId !== null}
            >
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">
                  {user.name}
                </span>
                <span className="block text-xs text-muted">
                  {getRoleLabel(user.role)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
