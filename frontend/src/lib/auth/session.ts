import { redirect } from "next/navigation";

import { canAccessRoute, getDefaultRouteForRole } from "@/lib/auth/routes";
import { hasPublicEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/auth";

export type ActiveSession = {
  userId: string;
  email: string | undefined;
  profile: Profile;
};

export const PROFILE_COLUMNS =
  "id, full_name, role, phone, is_active, created_at, updated_at";

export async function getActiveSession(): Promise<ActiveSession | null> {
  if (!hasPublicEnv()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser(); // getUser, getSession değil (bkz. patterns/auth.md)

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    profile: profile as Profile,
  };
}

export async function requireActiveSession(): Promise<ActiveSession> {
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRouteAccess(
  pathname: string
): Promise<ActiveSession> {
  const session = await requireActiveSession();

  if (!canAccessRoute(session.profile.role, pathname)) {
    redirect(getDefaultRouteForRole(session.profile.role));
  }

  return session;
}
