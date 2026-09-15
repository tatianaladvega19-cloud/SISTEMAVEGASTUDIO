"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { allNavItems } from "./nav-items";
import { IconMenu } from "./icons";
import { useSession } from "@/lib/auth/session-context";
import Avatar from "@/components/ui/Avatar";
import NotificationBell from "@/components/notifications/NotificationBell";

interface TopbarProps {
  onMenuClick: () => void;
}

function getPageTitle(pathname: string): string {
  const match = allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  return match?.label ?? "VEGA STUDIO";
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { user } = useSession();

  const today = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-surface/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-black/5 md:hidden"
          aria-label="Abrir menú"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="hidden text-xs capitalize text-muted sm:block">
            {today}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <Link
          href="/perfil"
          className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-black/5"
        >
          <span className="hidden text-sm font-medium text-ink sm:block">
            {user.name}
          </span>
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
        </Link>
      </div>
    </header>
  );
}
