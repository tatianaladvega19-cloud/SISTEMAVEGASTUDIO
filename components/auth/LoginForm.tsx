"use client";

// Formulario de login real de VEGA STUDIO. Autentica contra Supabase
// Auth (ver lib/auth/session-context.tsx: login) y, si la cuenta tiene
// un perfil asignado en `profiles`, redirige al dashboard.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fieldControlClass } from "@/components/clients/FormField";
import { useSession } from "@/lib/auth/session-context";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    const loginError = await login(email.trim(), password);

    if (loginError) {
      setError(loginError);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
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
            required
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
            required
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
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
