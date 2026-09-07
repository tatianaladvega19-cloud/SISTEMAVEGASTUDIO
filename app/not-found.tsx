import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 text-center">
        <p className="text-sm font-semibold tracking-wide text-accent">404</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink">
          No encontramos lo que buscas
        </h1>
        <p className="mt-2 text-sm text-muted">
          El recurso solicitado no existe o fue eliminado.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
