import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

export async function createServerSupabaseClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // Not: @supabase/ssr burada `flowType`'ı her zaman "pkce"ye sabitler,
      // buradan verilen auth ayarını ezer — implicit'e geçirmeye çalışmayın.
      // E-posta bağlantıları bu yüzden PKCE'ye takılmasın diye token_hash
      // akışını kullanıyoruz (bkz. app/(auth)/auth/confirm/route.ts).
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always set cookies. Proxy handles refresh.
          }
        },
      },
    }
  );
}
