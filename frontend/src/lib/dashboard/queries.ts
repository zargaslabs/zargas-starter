import { createServerSupabaseClient } from "@/lib/supabase/server";

// Yer tutucu metrik: yeni projede spec'teki metriklerle değiştir
// (her metrik ayrı fonksiyon, sayfada tek Promise.all — bkz. docs/patterns/reports-excel.md).
export type DashboardMetrics = {
  activeUsers: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createServerSupabaseClient();

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  return {
    activeUsers: count ?? 0,
  };
}
