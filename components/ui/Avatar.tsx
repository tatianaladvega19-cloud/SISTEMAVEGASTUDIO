// Avatar reutilizable: muestra la foto de perfil si existe, o las
// iniciales del usuario si no. Centraliza esta lógica para que
// Sidebar, Topbar y /perfil no la dupliquen cada uno por su lado.

import { getInitials } from "@/lib/auth/session";

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  /** "solid" para fondos oscuros (Sidebar), "soft" para fondos claros. */
  variant?: "solid" | "soft";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-9 w-9 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-24 w-24 text-3xl",
};

const VARIANT_CLASSES: Record<NonNullable<AvatarProps["variant"]>, string> = {
  solid: "bg-accent text-white",
  soft: "bg-accent-soft text-accent",
};

export default function Avatar({
  name,
  avatarUrl,
  size = "md",
  variant = "soft",
  className = "",
}: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- preview
      // de object URL local (ver ProfileForm), no una imagen remota.
      <img
        src={avatarUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${VARIANT_CLASSES[variant]} ${sizeClass} ${className}`}
    >
      {getInitials(name)}
    </span>
  );
}
