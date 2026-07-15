import Link from "next/link";
import { AlertCircleIcon, PlusIcon } from "lucide-react";

import { UserTable } from "@/components/users/user-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/session";
import { dictionary, isUserErrorCode } from "@/lib/i18n/dictionaries";
import { listManagedUsers } from "@/lib/users/queries";

type UsersPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await requireRouteAccess("/settings/users");
  const { error } = await searchParams;
  const users = await listManagedUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {dictionary.users.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dictionary.users.description}
          </p>
        </div>
        <Button asChild>
          <Link href="/settings/users/new">
            <PlusIcon />
            {dictionary.users.invite}
          </Link>
        </Button>
      </div>

      {isUserErrorCode(error) ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{dictionary.userErrors[error]}</AlertDescription>
        </Alert>
      ) : null}

      <UserTable users={users} />
    </div>
  );
}
