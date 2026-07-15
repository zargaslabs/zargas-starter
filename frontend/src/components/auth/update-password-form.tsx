"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

import { updatePasswordAction } from "@/actions/auth";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dictionary } from "@/lib/i18n/dictionaries";

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <Alert variant={state.success ? "default" : "destructive"}>
          {state.success ? <CheckCircle2Icon /> : <AlertCircleIcon />}
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password">{dictionary.auth.newPassword}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          {dictionary.auth.confirmPassword}
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state.fieldErrors?.confirmPassword?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingText={dictionary.auth.updatingPassword}>
        {dictionary.auth.updatePassword}
      </SubmitButton>

      {state.success ? (
        <div className="text-center text-sm">
          <Link className="text-primary hover:underline" href="/login">
            {dictionary.auth.goToLogin}
          </Link>
        </div>
      ) : null}
    </form>
  );
}
