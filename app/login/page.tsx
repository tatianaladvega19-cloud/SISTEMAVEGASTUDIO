"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useSession } from "@/lib/auth/session-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, isReady } = useSession();

  useEffect(() => {
    if (isReady && user) {
      router.replace("/dashboard");
    }
  }, [isReady, user, router]);

  if (!isReady || user) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold tracking-wide text-ink">
            VEGA STUDIO
          </p>
          <p className="mt-1 text-sm text-muted">Sistema de gestión</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-ink">Bienvenido</h1>
            <p className="mt-1 text-sm text-muted">
              Ingresa tus datos para acceder al sistema.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
