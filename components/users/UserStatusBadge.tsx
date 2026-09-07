interface UserStatusBadgeProps {
  isActive: boolean;
}

export default function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-zinc-400"
        }`}
      />
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
