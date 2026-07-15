import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { UserForm } from "@/components/users/user-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRouteAccess } from "@/lib/auth/session";
import { dictionary } from "@/lib/i18n/dictionaries";

export default async function NewUserPage() {
  await requireRouteAccess("/settings/users");

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Button asChild size="sm" variant="ghost">
        <Link href="/settings/users">
          <ArrowLeftIcon />
          {dictionary.users.backToList}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.users.newTitle}</CardTitle>
          <CardDescription>{dictionary.users.newDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  );
}
