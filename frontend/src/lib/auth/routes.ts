import { LayoutDashboardIcon, UsersRoundIcon, type LucideIcon } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { AppRole } from "@/types/auth";

// Tek harita: hem sidebar menüsü hem route-rol yetkisi buradan üretilir.
// Yeni modülde buraya bir satır ekle (bkz. docs/patterns/crud-module.md #8).
export type NavItem = {
  href: string;
  labelKey: keyof Dictionary["nav"];
  icon: LucideIcon;
  roles: AppRole[];
};

export const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "dashboard",
    icon: LayoutDashboardIcon,
    roles: ["admin", "staff"],
  },
  {
    href: "/settings/users",
    labelKey: "users",
    icon: UsersRoundIcon,
    roles: ["admin"],
  },
];

const routePermissions: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/dashboard", roles: ["admin", "staff"] },
  { prefix: "/settings", roles: ["admin"] },
];

// Login sonrası yönlendirme; rol bazında farklı açılış sayfası buradan verilir.
const defaultRouteByRole: Record<AppRole, string> = {
  admin: "/dashboard",
  staff: "/dashboard",
};

export function getDefaultRouteForRole(role: AppRole): string {
  return defaultRouteByRole[role];
}

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  const match = routePermissions.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
  );

  if (!match) {
    return true;
  }

  return match.roles.includes(role);
}
