"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  mainNavItems,
  adminNavItems,
  getVisibleNavItems,
  type NavItem,
} from "./nav-items";
import { IconLogout } from "./icons";
import { useSession } from "@/lib/auth/session-context";
import { PERMISOS_POR_ROL } from "@/lib/permissions";
import { getRoleLabel } from "@/lib/auth/session";
import Avatar from "@/components/ui/Avatar";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function isRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();

  if (!user) return null;

  const permisos = PERMISOS_POR_ROL[user.role];
  const visibleMainItems = getVisibleNavItems(mainNavItems, permisos);
  const visibleAdminItems = getVisibleNavItems(adminNavItems, permisos);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const renderLink = (item: NavItem) => {
    const active = isRouteActive(pathname, item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-accent text-white shadow-sm"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-white transition-transform duration-200 ease-out md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-lg font-semibold tracking-wide">VEGA STUDIO</p>
          <p className="mt-0.5 text-xs text-white/50">Sistema de gestión</p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div className="space-y-1">{visibleMainItems.map(renderLink)}</div>

          {visibleAdminItems.length > 0 && (
            <div>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Administración
              </p>
              <div className="space-y-1">
                {visibleAdminItems.map(renderLink)}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 transition-colors hover:bg-white/10"
            >
              <Avatar
                name={user.name}
                avatarUrl={user.avatarUrl}
                variant="solid"
                size="sm"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {user.name}
                </span>
                <span className="block text-xs text-white/50">
                  {getRoleLabel(user.role)}
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <IconLogout className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
