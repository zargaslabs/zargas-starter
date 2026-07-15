"use client";

import { setUserActiveStatusAction } from "@/actions/users";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { dictionary } from "@/lib/i18n/dictionaries";
import type { ManagedUser } from "@/types/user";

type UserStatusDialogProps = {
  user: ManagedUser;
};

// Yıkıcı işlem her zaman AlertDialog onayından geçer (bkz. docs/patterns/ui-feedback.md).
export function UserStatusDialog({ user }: UserStatusDialogProps) {
  if (!user.is_active) {
    return (
      <form action={setUserActiveStatusAction}>
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="is_active" value="true" />
        <Button size="sm" variant="outline" type="submit">
          {dictionary.users.activate}
        </Button>
      </form>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          {dictionary.users.deactivate}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {dictionary.users.deactivateConfirmTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user.full_name} — {dictionary.users.deactivateConfirmDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{dictionary.users.cancel}</AlertDialogCancel>
          <form action={setUserActiveStatusAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="is_active" value="false" />
            <AlertDialogAction type="submit">
              {dictionary.users.confirm}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
