import { PROFILE_COLUMNS } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/auth";
import type { ManagedUser } from "@/types/user";

// Kullanıcı yönetimi admin client ile çalışır (e-posta bilgisi auth.users'ta).
// Bu sorgular sadece admin-korumalı sayfalardan çağrılır.

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const supabase = createAdminSupabaseClient();

  const [profilesResult, usersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("created_at", { ascending: true }),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (usersResult.error) {
    throw new Error(usersResult.error.message);
  }

  const emailById = new Map(
    usersResult.data.users.map((user) => [user.id, user.email ?? null])
  );

  return (profilesResult.data as Profile[]).map((profile) => ({
    ...profile,
    email: emailById.get(profile.id) ?? null,
  }));
}

export async function getManagedUser(
  userId: string
): Promise<ManagedUser | null> {
  const supabase = createAdminSupabaseClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    return null;
  }

  const { data: authUser } = await supabase.auth.admin.getUserById(userId);

  return {
    ...(profile as Profile),
    email: authUser.user?.email ?? null,
  };
}
