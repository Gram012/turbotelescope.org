// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isActiveUser } from "@/lib/authz"; // or inline check using role/isActive
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard-content";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin?callbackUrl=/dashboard");
  if (!isActiveUser(session)) redirect("/access-pending");

  // User view: identical layout, but without WAZ Alerts
  return (
    <DashboardContent
      showWazAlerts={false}
      owner="patkel"
      repo="turbo_telescope"
    />
  );
}
