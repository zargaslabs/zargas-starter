import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// Supabase e-posta bağlantılarının (davet + şifre sıfırlama) indiği yer.
//
// token_hash akışı doğrulamayı sunucuda yapar; PKCE'deki gibi isteği başlatan
// tarayıcıda saklanan "code_verifier" çerezine ihtiyaç duymaz. Bu yüzden
// bağlantı hangi cihazda/tarayıcıda açılırsa açılsın (mobil Gmail uygulamasının
// kendi tarayıcısı, başka bir bilgisayar vb.) çalışır.
//
// E-posta şablonundaki bağlantı şu biçimde olmalı (bkz. supabase/email-templates/README.md):
// {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/update-password

const confirmTypes = [
  "recovery",
  "invite",
  "signup",
  "magiclink",
  "email_change",
  "email",
] as const;

type ConfirmType = (typeof confirmTypes)[number];

function sanitizeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function isConfirmType(value: string | null): value is ConfirmType {
  return value !== null && (confirmTypes as readonly string[]).includes(value);
}

function getFallbackTarget(type: ConfirmType): string {
  return type === "recovery" || type === "invite" ? "/update-password" : "/";
}

// Netlify'ın Next runtime'ı, yönlendirme hedefinin kendi sorgu dizesi yoksa
// gelen isteğin sorgusunu hedefe kopyalıyor; bu da harcanmış token_hash'in
// adres çubuğuna ve tarayıcı geçmişine düşmesine yol açıyor. Hedefe kendi
// sorgusunu vererek bunu engelliyoruz (lokalde bu davranış yok, zararsız).
function withOwnQuery(target: string, type: ConfirmType): string {
  return target.includes("?") ? target : `${target}?from=${type}`;
}

export async function GET(request: NextRequest): Promise<never> {
  const searchParams = request.nextUrl.searchParams;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextPath = sanitizeNextPath(searchParams.get("next"));

  if (!tokenHash || !isConfirmType(type)) {
    redirect("/login?error=invalid_link");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    redirect("/login?error=invalid_link");
  }

  redirect(withOwnQuery(nextPath ?? getFallbackTarget(type), type));
}
