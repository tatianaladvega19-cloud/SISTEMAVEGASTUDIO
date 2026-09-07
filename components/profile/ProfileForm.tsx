"use client";

// Formulario de datos personales de /perfil. Edita siempre al usuario
// de la sesión activa (useSession) y nunca a otro usuario: no recibe
// ningún id por props ni por ruta.
//
// La foto de perfil se maneja como preview local con
// URL.createObjectURL: no hay subida real todavía. Ese blob URL solo
// se guarda en el estado de sesión en memoria (ver
// lib/auth/session-context.tsx); lib/auth/profile.ts se encarga de no
// persistirlo en localStorage porque no sobreviviría a un recargo de
// página. El día que exista subida real de archivos, solo habría que
// reemplazar handleFileChange para que suba el archivo y guarde la URL
// definitiva que devuelva el servidor.

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import FormField, { fieldControlClass } from "@/components/clients/FormField";
import DashboardCard from "@/components/dashboard/DashboardCard";
import Avatar from "@/components/ui/Avatar";
import { useSession } from "@/lib/auth/session-context";

interface FormValues {
  name: string;
  username: string;
  email: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function ProfileForm() {
  const { user, updateCurrentUser } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<FormValues>({
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    user?.avatarUrl
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setValues({ name: user.name, username: user.username, email: user.email });
    setAvatarPreview(user.avatarUrl);
  }, [user]);

  if (!user) return null;

  const handleChange =
    (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      setSuccess(false);
    };

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const nextUrl = URL.createObjectURL(file);
    setAvatarPreview((previous) => {
      if (previous && previous !== user.avatarUrl && previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }
      return nextUrl;
    });
    setSuccess(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = "El nombre completo es obligatorio.";
    }
    if (!values.username.trim()) {
      nextErrors.username = "El nombre de usuario es obligatorio.";
    }
    if (!values.email.trim()) {
      nextErrors.email = "El correo electrónico es obligatorio.";
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      nextErrors.email = "Ingresa un correo electrónico válido.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSuccess(false);
      return;
    }

    updateCurrentUser({
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      avatarUrl: avatarPreview,
    });
    setSuccess(true);
  };

  return (
    <DashboardCard title="Información personal">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Avatar name={values.name || user.name} avatarUrl={avatarPreview} size="lg" />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handlePickPhoto}
              className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-background"
            >
              Cambiar foto
            </button>
            <p className="mt-2 text-xs text-muted">
              JPG o PNG. Es solo una vista previa mientras no exista
              almacenamiento real de archivos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Nombre completo"
            htmlFor="name"
            required
            error={errors.name}
            className="sm:col-span-2"
          >
            <input
              id="name"
              type="text"
              value={values.name}
              onChange={handleChange("name")}
              className={fieldControlClass(!!errors.name)}
            />
          </FormField>

          <FormField
            label="Nombre de usuario"
            htmlFor="username"
            required
            error={errors.username}
          >
            <input
              id="username"
              type="text"
              value={values.username}
              onChange={handleChange("username")}
              className={fieldControlClass(!!errors.username)}
            />
          </FormField>

          <FormField
            label="Correo electrónico"
            htmlFor="email"
            required
            error={errors.email}
          >
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              className={fieldControlClass(!!errors.email)}
            />
          </FormField>
        </div>

        {success && (
          <p className="text-sm text-green-600">
            Perfil actualizado correctamente.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </DashboardCard>
  );
}
