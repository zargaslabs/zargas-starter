"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/auth/routes";
import { dictionary } from "@/lib/i18n/dictionaries";
import type { Profile } from "@/types/auth";

type ProtectedShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function ProtectedShell({ profile, children }: ProtectedShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <Link className="font-heading text-lg font-semibold" href="/">
              {dictionary.common.appName}
            </Link>
            <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate">{profile.full_name}</span>
              <Badge variant="secondary">
                {dictionary.roles[profile.role]}
              </Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-w-0 max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <nav className="flex min-w-0 gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {navigationItems
            .filter((item) => item.roles.includes(profile.role))
            .map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  href={item.href}
                >
                  <item.icon className="size-4" />
                  {dictionary.nav[item.labelKey]}
                </Link>
              );
            })}
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
