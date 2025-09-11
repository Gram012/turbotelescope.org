// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard-content";
import { isAdminSession } from "@/lib/authz";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard");
  if (isAdminSession(session)) redirect("/admin");

  // User view: identical layout, but without WAZ Alerts
  return (
    <DashboardContent
      showWazAlerts={false}
      owner="patkel"
      repo="turbo_telescope"
    />
  );
}
