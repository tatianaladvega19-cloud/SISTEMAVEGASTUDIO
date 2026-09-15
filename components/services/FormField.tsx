// Envoltorio reutilizable para campos de formulario de Servicios:
// label + control + mensaje de error, con el mismo estilo visual en
// todos los campos (mismo patrón que components/clients/FormField.tsx,
// duplicado a propósito para que el módulo Servicios no dependa de
// Clientes).

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  required,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Clase compartida para inputs/selects del formulario, para que todos
// los campos luzcan igual y cambien de color cuando tienen error.
export function fieldControlClass(hasError?: boolean): string {
  return [
    "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-ink",
    "placeholder:text-muted focus:outline-none focus:ring-2",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
      : "border-line focus:border-accent focus:ring-accent/20",
  ].join(" ");
}
