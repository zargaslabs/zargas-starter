import { LogOutIcon } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { dictionary } from "@/lib/i18n/dictionaries";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button size="sm" variant="outline" type="submit">
        <LogOutIcon />
        {dictionary.auth.logout}
      </Button>
    </form>
  );
}
