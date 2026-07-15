"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

import { requestPasswordResetAction } from "@/actions/auth";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dictionary } from "@/lib/i18n/dictionaries";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <Alert variant={state.success ? "default" : "destructive"}>
          {state.success ? <CheckCircle2Icon /> : <AlertCircleIcon />}
          <AlertDescription>
            {state.success ? dictionary.auth.resetLinkSent : state.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">{dictionary.auth.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        {state.fieldErrors?.email?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingText={dictionary.auth.sendingResetLink}>
        {dictionary.auth.sendResetLink}
      </SubmitButton>

      <div className="text-center text-sm">
        <Link className="text-primary hover:underline" href="/login">
          {dictionary.auth.backToLogin}
        </Link>
      </div>
    </form>
  );
}
