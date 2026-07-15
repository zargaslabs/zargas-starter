"use server";

import { redirect } from "next/navigation";

import { getDefaultRouteForRole } from "@/lib/auth/routes";
import { PROFILE_COLUMNS } from "@/lib/auth/session";
import { withToast } from "@/lib/feedback/toast";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthFormState, Profile } from "@/types/auth";
import {
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "@/validations/auth";

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    "http://localhost:3000"
  );
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "İşaretli alanları kontrol edin.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      message: "E-posta veya şifre hatalı.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Oturum yüklenemedi. Tekrar deneyin.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return {
      message: "Bu hesaba bağlı bir kullanıcı profili bulunamadı.",
    };
  }

  const typedProfile = profile as Profile;

  if (!typedProfile.is_active) {
    await supabase.auth.signOut();
    return {
      message: "Bu hesap pasif durumda. Yöneticinizle iletişime geçin.",
    };
  }

  redirect(getDefaultRouteForRole(typedProfile.role));
}

export async function logoutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Geçerli bir e-posta adresi girin.",
    };
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/update-password`,
  });

  return {
    success: true,
    message:
      "Bu e-postaya kayıtlı bir hesap varsa sıfırlama bağlantısı gönderildi.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "İşaretli alanları kontrol edin.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      message:
        "Bağlantı geçersiz veya süresi dolmuş. Yeni bir şifre sıfırlama isteği gönderin.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message:
        "Şifre güncellendi ancak oturum yüklenemedi. Tekrar giriş yapın.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !(profile as Profile).is_active) {
    await supabase.auth.signOut();
    return {
      message: "Bu hesap pasif durumda. Yöneticinizle iletişime geçin.",
    };
  }

  redirect(
    withToast(
      getDefaultRouteForRole((profile as Profile).role),
      "passwordUpdated"
    )
  );
}
