import Link from "next/link";

import { UserStatusDialog } from "@/components/users/user-status-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dictionary } from "@/lib/i18n/dictionaries";
import type { ManagedUser } from "@/types/user";

type UserTableProps = {
  users: ManagedUser[];
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? dictionary.users.active : dictionary.users.inactive}
    </Badge>
  );
}

// Masaüstünde tablo, mobilde kart görünümü (bkz. docs/patterns/crud-module.md #6).
export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {dictionary.users.empty}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dictionary.users.fullName}</TableHead>
              <TableHead>{dictionary.users.email}</TableHead>
              <TableHead>{dictionary.users.role}</TableHead>
              <TableHead>{dictionary.users.status}</TableHead>
              <TableHead className="text-right">
                {dictionary.users.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email ?? "—"}
                </TableCell>
                <TableCell>{dictionary.roles[user.role]}</TableCell>
                <TableCell>
                  <StatusBadge isActive={user.is_active} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/settings/users/${user.id}`}>
                        {dictionary.users.edit}
                      </Link>
                    </Button>
                    <UserStatusDialog user={user} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.full_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email ?? "—"}
                  </p>
                </div>
                <StatusBadge isActive={user.is_active} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {dictionary.roles[user.role]}
                </span>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/settings/users/${user.id}`}>
                      {dictionary.users.edit}
                    </Link>
                  </Button>
                  <UserStatusDialog user={user} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
