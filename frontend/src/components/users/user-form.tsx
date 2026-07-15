"use client";

import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";

import { inviteUserAction, updateUserProfileAction } from "@/actions/users";
import { PendingButton } from "@/components/forms/pending-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dictionary } from "@/lib/i18n/dictionaries";
import type { AppRole } from "@/types/auth";
import type { ManagedUser } from "@/types/user";
import { roleValues } from "@/validations/user";

type UserFormProps = {
  user?: ManagedUser;
};

export function UserForm({ user }: UserFormProps) {
  const action = user
    ? updateUserProfileAction.bind(null, user.id)
    : inviteUserAction;
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="full_name">{dictionary.users.fullName}</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={user?.full_name ?? ""}
          required
        />
        {state.fieldErrors?.full_name?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.full_name[0]}
          </p>
        ) : null}
      </div>

      {user ? null : (
        <div className="space-y-2">
          <Label htmlFor="email">{dictionary.users.email}</Label>
          <Input id="email" name="email" type="email" required />
          {state.fieldErrors?.email?.[0] ? (
            <p className="text-sm text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="role">{dictionary.users.role}</Label>
        <Select name="role" defaultValue={user?.role ?? "staff"}>
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleValues.map((role: AppRole) => (
              <SelectItem key={role} value={role}>
                {dictionary.roles[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.role?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.role[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{dictionary.users.phoneOptional}</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={user?.phone ?? ""}
        />
        {state.fieldErrors?.phone?.[0] ? (
          <p className="text-sm text-destructive">
            {state.fieldErrors.phone[0]}
          </p>
        ) : null}
      </div>

      <PendingButton
        type="submit"
        className="w-full"
        pendingLabel={
          user ? dictionary.users.saving : dictionary.users.sendingInvite
        }
      >
        {user ? dictionary.users.save : dictionary.users.sendInvite}
      </PendingButton>
    </form>
  );
}
