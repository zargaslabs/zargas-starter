"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { dictionary } from "@/lib/i18n/dictionaries";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function sanitizeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function getAuthTarget(type: string | null, nextPath: string | null): string {
  if (nextPath) {
    return nextPath;
  }

  if (type === "invite" || type === "recovery") {
    return "/update-password";
  }

  return "/";
}

function cleanCallbackUrl() {
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("error");
  url.searchParams.delete("error_code");
  url.searchParams.delete("error_description");
  window.history.replaceState(null, document.title, url.toString());
}

export function AuthCallbackHandler() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function processCallback() {
      const supabase = createBrowserSupabaseClient();
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(
        url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
      );
      const searchParams = url.searchParams;
      const hashError =
        hashParams.get("error_description") ??
        hashParams.get("error") ??
        searchParams.get("error_description") ??
        searchParams.get("error");

      if (hashError) {
        cleanCallbackUrl();
        router.replace("/login?error=invalid_link");
        return;
      }

      const nextPath = sanitizeNextPath(searchParams.get("next"));
      const type = hashParams.get("type") ?? searchParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          cleanCallbackUrl();
          router.replace("/login?error=invalid_link");
          return;
        }

        cleanCallbackUrl();
        router.replace(getAuthTarget(type, nextPath));
        return;
      }

      const code = searchParams.get("code");

      if (code) {
        // supabase-js'in `detectSessionInUrl` ayarı açık olduğu için client
        // oluşturulurken code'u kendisi takas etmiş ve tek kullanımlık
        // code_verifier'ı silmiş olabilir. Bu durumda ikinci bir takas denemesi
        // her zaman hata verir; önce oturumun kurulup kurulmadığına bakıyoruz.
        const {
          data: { session: exchangedSession },
        } = await supabase.auth.getSession();

        if (exchangedSession) {
          cleanCallbackUrl();
          router.replace(getAuthTarget(type, nextPath));
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          cleanCallbackUrl();
          router.replace("/login?error=invalid_link");
          return;
        }

        cleanCallbackUrl();
        router.replace(getAuthTarget(type, nextPath));
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        cleanCallbackUrl();
        router.replace(getAuthTarget(type, nextPath));
        return;
      }

      cleanCallbackUrl();

      if (!cancelled) {
        setErrorMessage(dictionary.auth.invalidAuthLink);
      }

      router.replace("/login?error=invalid_link");
    }

    void processCallback();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (errorMessage) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2Icon className="size-4 animate-spin" />
      <span>{dictionary.auth.processingInvite}</span>
    </div>
  );
}
