"use client";

import { Loader2Icon } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type PendingButtonProps = React.ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

export function PendingButton({
  children,
  disabled,
  pendingLabel,
  ...props
}: PendingButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;
  const isIconOnly =
    typeof props.size === "string" && props.size.startsWith("icon");

  return (
    <Button
      aria-disabled={isDisabled}
      disabled={isDisabled}
      {...props}
    >
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" />
          {pendingLabel ? (
            <span className={isIconOnly ? "sr-only" : undefined}>
              {pendingLabel}
            </span>
          ) : null}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
