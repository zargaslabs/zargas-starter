import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getManagedUser } from "@/lib/users/queries";

type EditUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireRouteAccess("/settings/users");
  const { id } = await params;
  const user = await getManagedUser(id);

  if (!user) {
    notFound();
  }

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
          <CardTitle>{dictionary.users.editTitle}</CardTitle>
          <CardDescription>{user.email ?? user.full_name}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
