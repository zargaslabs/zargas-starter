"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";

import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dictionary } from "@/lib/i18n/dictionaries";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{state.message}</AlertDescription>
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

      <div className="space-y-2">
        <Label htmlFor="password">{dictionary.auth.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.fieldErrors?.password?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingText={dictionary.auth.signingIn}>
        {dictionary.auth.signIn}
      </SubmitButton>

      <div className="text-center text-sm">
        <Link className="text-primary hover:underline" href="/reset-password">
          {dictionary.auth.forgotPassword}
        </Link>
      </div>
    </form>
  );
}
