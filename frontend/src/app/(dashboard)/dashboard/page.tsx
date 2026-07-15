import { UsersRoundIcon } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { requireRouteAccess } from "@/lib/auth/session";
import { getDashboardMetrics } from "@/lib/dashboard/queries";
import { dictionary } from "@/lib/i18n/dictionaries";

export default async function DashboardPage() {
  await requireRouteAccess("/dashboard");
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {dictionary.dashboard.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dictionary.dashboard.description}
        </p>
      </div>

      {/* TODO: project-spec.md'deki metriklerle bu bölümü doldur */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title={dictionary.dashboard.activeUsers}
          value={metrics.activeUsers}
          description={dictionary.dashboard.activeUsersDescription}
          icon={UsersRoundIcon}
        />
      </section>

      <p className="text-sm text-muted-foreground">
        {dictionary.dashboard.placeholderNote}
      </p>
    </div>
  );
}
