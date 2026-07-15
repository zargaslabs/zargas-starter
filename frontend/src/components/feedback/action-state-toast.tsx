"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionToastState = {
  message?: string;
  success?: boolean;
};

type ActionStateToastProps = {
  state: ActionToastState;
  successMessage?: string;
};

export function ActionStateToast({
  state,
  successMessage,
}: ActionStateToastProps) {
  const previousStateRef = useRef<ActionToastState | null>(null);

  useEffect(() => {
    if (previousStateRef.current === state) {
      return;
    }

    previousStateRef.current = state;

    const message = state.success ? successMessage ?? state.message : state.message;

    if (!message) {
      return;
    }

    if (state.success) {
      toast.success(message);
      return;
    }

    toast.error(message);
  }, [state, successMessage]);

  return null;
}
