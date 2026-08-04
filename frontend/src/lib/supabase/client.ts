import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const env = getPublicEnv();

  // Not: @supabase/ssr `flowType`'ı her zaman "pkce"ye sabitler, buradan
  // verilen auth ayarını ezer — implicit'e geçirmeye çalışmayın. E-posta
  // bağlantıları PKCE'ye takılmasın diye token_hash akışını kullanıyoruz
  // (bkz. app/(auth)/auth/confirm/route.ts).
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
