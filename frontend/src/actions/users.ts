"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getActiveSession } from "@/lib/auth/session";
import type { UserErrorCode } from "@/lib/i18n/dictionaries";
import { withToast } from "@/lib/feedback/toast";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { UserFormState } from "@/types/user";
import { inviteUserSchema, userProfileSchema } from "@/validations/user";

const USERS_PATH = "/settings/users";

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    "http://localhost:3000"
  );
}

async function requireUserManagementAdmin(): Promise<{
  userId: string;
  error?: UserFormState;
}> {
  const session = await getActiveSession();

  if (!session) {
    return {
      userId: "",
      error: { message: "Bu işlem için giriş yapmalısınız." },
    };
  }

  if (session.profile.role !== "admin") {
    return {
      userId: session.userId,
      error: { message: "Kullanıcı yönetimi için yönetici yetkisi gerekir." },
    };
  }

  return { userId: session.userId };
}

function getAdminClientOrState():
  | ReturnType<typeof createAdminSupabaseClient>
  | UserFormState {
  try {
    return createAdminSupabaseClient();
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Kullanıcı yönetimi için service role anahtarı gerekli.",
    };
  }
}

function isFormState(
  value: ReturnType<typeof createAdminSupabaseClient> | UserFormState
): value is UserFormState {
  return "message" in value || "fieldErrors" in value;
}

function redirectWithError(code: UserErrorCode): never {
  redirect(`${USERS_PATH}?error=${code}`);
}

async function getActiveAdminCount(
  supabase: ReturnType<typeof createAdminSupabaseClient>
): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function inviteUserAction(
  _previousState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const auth = await requireUserManagementAdmin();

  if (auth.error) {
    return auth.error;
  }

  const parsed = inviteUserSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    role: formData.get("role"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      message: "İşaretli alanları kontrol edin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = getAdminClientOrState();

  if (isFormState(supabase)) {
    return supabase;
  }

  const { data: inviteData, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        role: parsed.data.role,
      },
      redirectTo: `${getSiteUrl()}/auth/callback`,
    });

  if (inviteError) {
    return { message: inviteError.message };
  }

  if (!inviteData.user) {
    return { message: "Davet gönderilemedi. Tekrar deneyin." };
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: inviteData.user.id,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      role: parsed.data.role,
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return {
      message: `Davet gönderildi ancak profil oluşturulamadı: ${profileError.message}`,
    };
  }

  revalidatePath(USERS_PATH);
  redirect(withToast(USERS_PATH, "userInvited"));
}

export async function updateUserProfileAction(
  userId: string,
  _previousState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const auth = await requireUserManagementAdmin();

  if (auth.error) {
    return auth.error;
  }

  const parsed = userProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      message: "İşaretli alanları kontrol edin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = getAdminClientOrState();

  if (isFormState(supabase)) {
    return supabase;
  }

  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (existingError) {
    return { message: existingError.message };
  }

  if (!existingProfile) {
    return { message: "Kullanıcı profili bulunamadı." };
  }

  if (
    existingProfile.role === "admin" &&
    existingProfile.is_active &&
    parsed.data.role !== "admin"
  ) {
    const adminCount = await getActiveAdminCount(supabase);

    if (adminCount <= 1) {
      return {
        message: "Son aktif yöneticinin rolü değiştirilemez.",
      };
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      role: parsed.data.role,
    })
    .eq("id", userId);

  if (profileError) {
    return { message: profileError.message };
  }

  const { error: metadataError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        role: parsed.data.role,
      },
    }
  );

  if (metadataError) {
    return { message: metadataError.message };
  }

  revalidatePath(USERS_PATH);
  revalidatePath(`${USERS_PATH}/${userId}`);
  redirect(withToast(USERS_PATH, "userUpdated"));
}

export async function setUserActiveStatusAction(
  formData: FormData
): Promise<void> {
  const auth = await requireUserManagementAdmin();

  if (auth.error) {
    redirect("/dashboard");
  }

  const userId = String(formData.get("userId") ?? "");
  const isActive = formData.get("is_active") === "true";

  if (!userId) {
    redirectWithError("missing_user");
  }

  if (!isActive && userId === auth.userId) {
    redirectWithError("self_deactivation");
  }

  const supabase = getAdminClientOrState();

  if (isFormState(supabase)) {
    redirectWithError("service_role_missing");
  }

  const { data: existingProfile, error: existingError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (existingError || !existingProfile) {
    redirectWithError("missing_profile");
  }

  if (
    !isActive &&
    existingProfile.role === "admin" &&
    existingProfile.is_active
  ) {
    const adminCount = await getActiveAdminCount(supabase);

    if (adminCount <= 1) {
      redirectWithError("last_active_admin_deactivation");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    redirectWithError("status_update_failed");
  }

  revalidatePath(USERS_PATH);
  revalidatePath(`${USERS_PATH}/${userId}`);
  redirect(withToast(USERS_PATH, isActive ? "userActivated" : "userDeactivated"));
}
