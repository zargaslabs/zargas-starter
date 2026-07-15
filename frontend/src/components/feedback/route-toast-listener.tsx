"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { dictionary } from "@/lib/i18n/dictionaries";
import { isToastKey, toastSearchParam } from "@/lib/feedback/toast";

export function RouteToastListener() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shownToastRef = useRef<string | null>(null);
  const toastKey = searchParams.get(toastSearchParam);

  useEffect(() => {
    if (!isToastKey(toastKey)) {
      return;
    }

    const signature = `${pathname}:${searchParams.toString()}`;

    if (shownToastRef.current === signature) {
      return;
    }

    shownToastRef.current = signature;
    toast.success(dictionary.feedback[toastKey]);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete(toastSearchParam);
    const nextQuery = nextParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams, toastKey]);

  return null;
}
