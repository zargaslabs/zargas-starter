import { ProtectedShell } from "@/components/layout/protected-shell";
import { requireActiveSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireActiveSession();

  return <ProtectedShell profile={session.profile}>{children}</ProtectedShell>;
}
