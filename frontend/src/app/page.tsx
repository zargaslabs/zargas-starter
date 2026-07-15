import { redirect } from "next/navigation";

import { getDefaultRouteForRole } from "@/lib/auth/routes";
import { getActiveSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  redirect(getDefaultRouteForRole(session.profile.role));
}
